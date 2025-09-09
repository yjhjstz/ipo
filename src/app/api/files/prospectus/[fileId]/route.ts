import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync, statSync } from 'fs'
import path from 'path'
import { tmpdir } from 'os'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    
    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json({ error: '无效的文件ID' }, { status: 400 })
    }

    // 验证文件ID格式（UUID）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(fileId)) {
      return NextResponse.json({ error: '无效的文件ID格式' }, { status: 400 })
    }

    const uploadDir = path.join(tmpdir(), 'prospectus-uploads')
    const fileName = `prospectus-${fileId}.pdf`
    const filePath = path.join(uploadDir, fileName)

    // 安全检查：确保文件路径在允许的目录内
    const resolvedPath = path.resolve(filePath)
    const resolvedUploadDir = path.resolve(uploadDir)
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json({ error: '非法的文件路径' }, { status: 403 })
    }

    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: '文件不存在或已过期' }, { status: 404 })
    }

    // 检查文件年龄（超过24小时自动过期）
    try {
      const stats = statSync(filePath)
      const fileAge = Date.now() - stats.mtime.getTime()
      const maxAge = 24 * 60 * 60 * 1000 // 24小时

      if (fileAge > maxAge) {
        return NextResponse.json({ error: '文件已过期，请重新上传' }, { status: 410 })
      }
    } catch (statError) {
      console.error('File stat error:', statError)
      return NextResponse.json({ error: '无法访问文件' }, { status: 500 })
    }

    try {
      // 读取文件内容
      const fileBuffer = readFileSync(filePath)
      
      // 验证文件是否为有效PDF（检查PDF头部）
      const pdfHeader = fileBuffer.slice(0, 4).toString()
      if (pdfHeader !== '%PDF') {
        return NextResponse.json({ error: '无效的PDF文件' }, { status: 400 })
      }
      
      // 设置安全响应头
      const headers = new Headers({
        'Content-Type': 'application/pdf',
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': 'inline; filename="prospectus.pdf"',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer'
      })

      return new NextResponse(fileBuffer, {
        status: 200,
        headers
      })

    } catch (readError) {
      console.error('File read error:', readError)
      return NextResponse.json({ error: '文件读取失败' }, { status: 500 })
    }

  } catch (error) {
    console.error('File access error:', error)
    return NextResponse.json({
      error: '文件访问失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}