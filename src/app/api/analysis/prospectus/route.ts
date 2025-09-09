import { NextRequest, NextResponse } from 'next/server'
import { createPerplexityAIService } from '@/lib/perplexity-ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdfUrl } = body

    if (!pdfUrl || typeof pdfUrl !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的PDF URL' },
        { status: 400 }
      )
    }

    // 验证URL格式
    try {
      new URL(pdfUrl)
    } catch {
      return NextResponse.json(
        { error: '请提供有效的URL格式' },
        { status: 400 }
      )
    }

    // 检查是否为PDF文件
    if (!pdfUrl.toLowerCase().endsWith('.pdf') && !pdfUrl.includes('pdf')) {
      return NextResponse.json(
        { error: '请提供PDF文件的URL' },
        { status: 400 }
      )
    }

    const perplexityService = createPerplexityAIService()
    const analysis = await perplexityService.analyzeProspectus(pdfUrl)

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Prospectus analysis API error:', error)
    
    return NextResponse.json(
      {
        error: '招股书分析失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}