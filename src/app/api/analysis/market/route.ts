import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPerplexityAIService } from '@/lib/perplexity-ai'
import { createGitHubAIService } from '@/lib/github-ai'

// POST /api/analysis/market - 获取市场分析
export async function POST(request: NextRequest) {
  try {
    const { market, provider = 'perplexity' } = await request.json()
    
    // 获取IPO数据
    const stocks = await prisma.ipoStock.findMany({
      where: {
        status: {
          not: 'WITHDRAWN'
        },
        ...(market && { market: market as 'US' | 'HK' })
      },
      orderBy: { ipoDate: 'asc' },
      take: 50 // 限制数据量以提高性能
    })

    if (stocks.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No IPO data available for analysis'
      }, { status: 404 })
    }

    // 选择AI服务提供商
    let analysis
    if (provider === 'claude') {
      const githubService = createGitHubAIService()
      analysis = await githubService.analyzeMarket(stocks)
    } else {
      // 默认使用Perplexity AI
      const perplexityService = createPerplexityAIService()
      analysis = await perplexityService.analyzeMarket(stocks)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        dataPoints: stocks.length,
        market: market || 'All Markets',
        provider: provider === 'claude' ? 'GitHub AI (GPT-4.1)' : 'Perplexity AI'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Market analysis failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Market analysis failed', 
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}

// GET /api/analysis/market - 获取市场统计信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const market = searchParams.get('market')
    
    const stats = await prisma.ipoStock.groupBy({
      by: ['status', 'market'],
      _count: { id: true },
      _avg: { expectedPrice: true },
      where: {
        status: {
          not: 'WITHDRAWN'
        },
        ...(market && { market: market as 'US' | 'HK' })
      }
    })

    const totalVolume = await prisma.ipoStock.aggregate({
      _sum: { sharesOffered: true },
      _count: { id: true },
      where: {
        status: {
          not: 'WITHDRAWN'
        },
        ...(market && { market: market as 'US' | 'HK' })
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        stats,
        totalVolume: totalVolume._sum.sharesOffered || 0,
        totalCount: totalVolume._count.id,
        message: 'Use POST method to get AI market analysis'
      }
    })
  } catch (error) {
    console.error('Failed to get market stats:', error)
    return NextResponse.json(
      { error: 'Failed to get market statistics' }, 
      { status: 500 }
    )
  }
}