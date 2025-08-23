import { NextRequest, NextResponse } from 'next/server'

export interface NewsItem {
  id: number
  headline: string
  summary: string
  url: string
  image: string
  datetime: number
  category: string
  source: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'general'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!process.env.FINNHUB_API_KEY) {
      return NextResponse.json(
        { error: 'Finnhub API key not configured' },
        { status: 500 }
      )
    }

    const url = `https://finnhub.io/api/v1/news?category=${category}&token=${process.env.FINNHUB_API_KEY}`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const news: NewsItem[] = await response.json()
    
    const limitedNews = news.slice(0, limit).map(item => ({
      ...item,
      datetime: item.datetime * 1000,
    }))

    return NextResponse.json(limitedNews)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market news' },
      { status: 500 }
    )
  }
}