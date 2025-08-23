import { NextRequest, NextResponse } from 'next/server'

export interface MarketHoliday {
  eventName: string
  atDate: string
  countryCode: string
  exchangeCode: string
  tradingHour: string | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const exchange = searchParams.get('exchange') || 'US'

    if (!process.env.FINNHUB_API_KEY) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    const url = `https://finnhub.io/api/v1/calendar/market-holiday?exchange=${exchange}&token=${process.env.FINNHUB_API_KEY}`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()
    
    // 过滤并排序即将到来的假期
    const currentDate = new Date()
    const upcomingHolidays = data.data
      ?.filter((holiday: MarketHoliday) => new Date(holiday.atDate) >= currentDate)
      ?.sort((a: MarketHoliday, b: MarketHoliday) => 
        new Date(a.atDate).getTime() - new Date(b.atDate).getTime()
      ) || []

    return NextResponse.json({
      exchange,
      holidays: upcomingHolidays.slice(0, 10) // 只返回前10个即将到来的假期
    })
  } catch (error) {
    console.error('Error fetching market holidays:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market holidays' },
      { status: 500 }
    )
  }
}