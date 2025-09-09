import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '请选择要上传的PDF文件' }, { status: 400 })
    }

    // 验证文件类型 - 只支持PDF
    const allowedTypes = ['application/pdf']
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ 
        error: '只支持PDF格式的招股书文件' 
      }, { status: 400 })
    }

    // 验证文件名（防止路径遍历攻击）
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_\u4e00-\u9fff]/g, '_')
    if (file.name !== sanitizedFileName) {
      console.warn(`Filename sanitized: ${file.name} -> ${sanitizedFileName}`)
    }

    // 验证文件大小 (最大 50MB - 招股书通常较大)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: '文件过大，最大支持50MB的PDF文件' 
      }, { status: 400 })
    }

    // 验证文件内容不为空
    if (file.size === 0) {
      return NextResponse.json({ 
        error: '文件内容为空' 
      }, { status: 400 })
    }

    // 创建专门的招股书上传目录
    const uploadDir = path.join(tmpdir(), 'prospectus-uploads')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true, mode: 0o700 })
    }

    // 使用原始文件名，但添加时间戳避免冲突
    const timestamp = Date.now()
    const fileExtension = path.extname(sanitizedFileName) || '.pdf'
    const baseFileName = path.basename(sanitizedFileName, fileExtension)
    const fileName = `${baseFileName}_${timestamp}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)
    
    // 生成用于API访问的唯一ID
    const fileId = randomUUID()

    // 安全检查：确保文件路径在允许的目录内
    const resolvedPath = path.resolve(filePath)
    const resolvedUploadDir = path.resolve(uploadDir)
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json({ error: '非法的文件路径' }, { status: 403 })
    }

    // 读取并验证文件内容
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 验证PDF文件头
    const pdfHeader = buffer.slice(0, 4).toString()
    if (pdfHeader !== '%PDF') {
      return NextResponse.json({ 
        error: '无效的PDF文件格式' 
      }, { status: 400 })
    }

    // 保存文件
    try {
      writeFileSync(filePath, buffer, { mode: 0o600 })
    } catch (writeError) {
      console.error('File write error:', writeError)
      return NextResponse.json({ 
        error: '文件保存失败' 
      }, { status: 500 })
    }

    // 保存文件映射信息（fileId -> 实际文件名）
    const mappingFile = path.join(uploadDir, `${fileId}.json`)
    const mappingInfo = {
      fileId,
      originalName: file.name,
      sanitizedName: sanitizedFileName,
      actualFileName: fileName,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type
    }
    
    try {
      writeFileSync(mappingFile, JSON.stringify(mappingInfo, null, 2), { mode: 0o600 })
    } catch (mappingError) {
      console.error('Mapping file write error:', mappingError)
      // 继续执行，不阻塞主流程
    }

    // 生成内部访问URL（不对外暴露实际路径）
    const internalUrl = `/api/files/prospectus/${fileId}`

    // 返回文件信息
    const fileInfo = {
      id: fileId,
      originalName: file.name,
      sanitizedName: sanitizedFileName,
      fileName: fileName,
      internalUrl: internalUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }

    console.log(`Prospectus uploaded: ${file.name} (${file.size} bytes) -> ${fileName}`)

    return NextResponse.json({
      success: true,
      message: 'PDF招股书上传成功',
      data: fileInfo
    })

  } catch (error) {
    console.error('Prospectus upload error:', error)
    return NextResponse.json({
      error: '文件上传失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}