import { NextRequest, NextResponse } from 'next/server'
import { SECApiService } from '@/lib/external-apis'

const SEC_API_KEY = process.env.SEC_API_KEY || 'cab489c1ad729ccb54c0ec67422849b941647990b6c60830784462609eb48050'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get('ticker')
    const formType = searchParams.get('formType') || '10-K'
    const size = searchParams.get('size') || '10'

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      )
    }

    console.log(`Searching SEC filings for ${ticker}, formType: ${formType}`)

    const secApiService = new SECApiService({ apiKey: SEC_API_KEY })
    
    const result = await secApiService.searchFilings({
      ticker: ticker.toUpperCase(),
      formType,
      size
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('SEC search API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search SEC filings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticker, formTypes = ['10-K', '10-Q'], limit = 10 } = body

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      )
    }

    console.log(`Getting company filings for ${ticker}`)

    const secApiService = new SECApiService({ apiKey: SEC_API_KEY })
    
    const filings = await secApiService.getCompanyFilings(
      ticker.toUpperCase(),
      formTypes,
      limit
    )

    return NextResponse.json({
      success: true,
      data: {
        ticker: ticker.toUpperCase(),
        filings,
        total: filings.length
      }
    })

  } catch (error) {
    console.error('SEC company filings API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get company filings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}