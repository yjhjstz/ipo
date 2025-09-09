import { NextRequest, NextResponse } from 'next/server'
import { unlinkSync, existsSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { tmpdir } from 'os'

// 清理超过24小时的临时文件
export async function POST() {
  try {
    const uploadDir = path.join(tmpdir(), 'prospectus-uploads')
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({ 
        success: true, 
        message: '上传目录不存在，无需清理',
        cleaned: 0 
      })
    }

    const files = readdirSync(uploadDir)
    let cleanedCount = 0
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时

    for (const fileName of files) {
      const filePath = path.join(uploadDir, fileName)
      
      try {
        const stats = statSync(filePath)
        const fileAge = now - stats.mtime.getTime()
        
        // 如果文件超过24小时，则删除
        if (fileAge > maxAge) {
          unlinkSync(filePath)
          cleanedCount++
          console.log(`Cleaned old prospectus file: ${fileName}`)
        }
      } catch (error) {
        console.error(`Error processing file ${fileName}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `清理完成，删除了 ${cleanedCount} 个过期文件`,
      cleaned: cleanedCount
    })

  } catch (error) {
    console.error('File cleanup error:', error)
    return NextResponse.json({
      error: '文件清理失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 删除特定文件
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId } = body

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

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 })
    }

    unlinkSync(filePath)
    console.log(`Deleted prospectus file: ${fileName}`)

    return NextResponse.json({
      success: true,
      message: '文件删除成功'
    })

  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json({
      error: '文件删除失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}