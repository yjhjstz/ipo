import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createPerplexityAIService } from '@/lib/perplexity-ai'
import { createGitHubAIService } from '@/lib/github-ai'

// POST /api/analysis/stock - 分析特定股票
export async function POST(request: NextRequest) {
  try {
    const { symbol, provider = 'perplexity' } = await request.json()
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' }, 
        { status: 400 }
      )
    }

    // 尝试获取IPO股票数据，如果不存在则创建基本股票对象
    let stock
    try {
      stock = await prisma.ipoStock.findFirst({
        where: {
          symbol: symbol,
          status: {
            not: 'WITHDRAWN'
          }
        }
      })
    } catch (error) {
      // 数据库连接问题，继续使用基本股票信息
      console.warn('Database connection issue:', error)
    }

    // 如果数据库中没有该股票，创建基本股票对象供分析
    if (!stock) {
      stock = {
        id: `temp-${symbol}`,
        symbol: symbol,
        companyName: symbol, // AI服务会获取真实公司名
        market: 'US', // 默认假设为美股
        status: 'LISTED', // 假设已上市
        expectedPrice: null,
        priceRange: null,
        sharesOffered: null,
        ipoDate: null,
        sector: null,
        industry: null,
        underwriters: null,
        marketCap: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // 选择AI服务提供商
    let analysis
    if (provider === 'claude') {
      const githubService = createGitHubAIService()
      analysis = await githubService.analyzeStock(stock)
    } else {
      // 默认使用Perplexity AI
      const perplexityService = createPerplexityAIService()
      analysis = await perplexityService.analyzeStock(stock)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        provider: provider === 'claude' ? 'GitHub AI (GPT-4.1)' : 'Perplexity AI'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Stock analysis failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Stock analysis failed', 
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}

// GET /api/analysis/stock?symbol=AAPL - 获取已保存的分析
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Stock symbol is required' }, 
        { status: 400 }
      )
    }

    // 这里可以添加缓存逻辑，暂时直接返回股票信息
    const stock = await prisma.ipoStock.findFirst({
      where: {
        symbol: symbol,
        status: {
          not: 'WITHDRAWN'
        }
      }
    })

    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: stock,
      message: 'Use POST method to get AI analysis'
    })
  } catch (error) {
    console.error('Failed to get stock data:', error)
    return NextResponse.json(
      { error: 'Failed to get stock data' }, 
      { status: 500 }
    )
  }
}