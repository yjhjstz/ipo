import { NextRequest, NextResponse } from 'next/server'
import { SECApiService, FilingContentAnalyzer } from '@/lib/external-apis'

const SEC_API_KEY = process.env.SEC_API_KEY || 'cab489c1ad729ccb54c0ec67422849b941647990b6c60830784462609eb48050'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filing } = body

    if (!filing || !filing.linkToFilingDetails) {
      return NextResponse.json(
        { error: 'Filing object with linkToFilingDetails is required' },
        { status: 400 }
      )
    }

    console.log(`Getting filing content for ${filing.ticker} ${filing.formType}`)

    const secApiService = new SECApiService({ apiKey: SEC_API_KEY })
    
    const htmlContent = await secApiService.getFilingContent(filing)
    
    // Analyze content for AI processing
    const analyzedContent = FilingContentAnalyzer.summarizeForAI(htmlContent)
    const financialTables = FilingContentAnalyzer.extractFinancialTables(htmlContent)
    const textSections = FilingContentAnalyzer.extractTextSections(htmlContent)

    return NextResponse.json({
      success: true,
      data: {
        filing: {
          id: filing.id,
          ticker: filing.ticker,
          companyName: filing.companyName,
          formType: filing.formType,
          filedAt: filing.filedAt
        },
        content: {
          raw: htmlContent,
          analyzed: analyzedContent,
          tables: financialTables.length,
          sections: textSections.map(s => s.section)
        },
        metadata: {
          contentLength: htmlContent.length,
          tablesFound: financialTables.length,
          sectionsFound: textSections.length,
          analyzedLength: analyzedContent.length
        }
      }
    })

  } catch (error) {
    console.error('SEC filing content API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get filing content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}