import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // 验证文件类型 - 只支持HTML
    const allowedTypes = ['text/html', 'application/html']
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      return NextResponse.json({ 
        error: '只支持HTML格式的财务报表文件' 
      }, { status: 400 })
    }

    // 验证文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    // 生成唯一文件名
    const fileId = randomUUID()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${fileId}.${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    writeFileSync(filePath, buffer)

    // 返回文件信息
    const fileInfo = {
      id: fileId,
      originalName: file.name,
      fileName: fileName,
      filePath: filePath,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }

    console.log(`File uploaded: ${file.name} (${file.size} bytes)`)

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: fileInfo
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}