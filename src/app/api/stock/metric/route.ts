import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const metric = searchParams.get('metric') || 'all'

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      )
    }

    const finnhubApiKey = process.env.FINNHUB_API_KEY
    if (!finnhubApiKey) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    // 获取基本财务指标数据
    const metricsResponse = await fetch(
      `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=${metric}&token=${finnhubApiKey}`
    )

    if (!metricsResponse.ok) {
      throw new Error('Failed to fetch financial metrics')
    }

    const metricsData = await metricsResponse.json()

    return NextResponse.json({
      symbol,
      metrics: metricsData
    })

  } catch (error) {
    console.error('Error fetching financial metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}