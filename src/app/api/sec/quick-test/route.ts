import { NextRequest, NextResponse } from 'next/server'
import { SECApiService, FilingContentAnalyzer } from '@/lib/external-apis'
import { GitHubAIService } from '@/lib/github-ai'

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

    console.log(`Quick test: Getting content and analyzing ${filing.ticker} ${filing.formType}`)

    const secApiService = new SECApiService({ apiKey: SEC_API_KEY })
    
    // 1. Get filing content
    const htmlContent = await secApiService.getFilingContent(filing)
    
    // 2. Analyze content for AI processing
    const analyzedContent = FilingContentAnalyzer.summarizeForAI(htmlContent)
    const financialTables = FilingContentAnalyzer.extractFinancialTables(htmlContent)
    const textSections = FilingContentAnalyzer.extractTextSections(htmlContent)

    // 3. Perform AI analysis (with shorter content to avoid token limits)
    console.log(`Starting AI analysis for ${filing.ticker} ${filing.formType}`)
    const startTime = Date.now()

    // Use only first 8000 characters for quick testing
    const contentForAI = analyzedContent.substring(0, 8000)

    const githubAI = new GitHubAIService()
    const aiAnalysisResult = await githubAI.analyzeFinancialFiling(
      filing.ticker,
      filing.companyName,
      filing.formType,
      contentForAI
    )

    const processingTime = Date.now() - startTime

    // 4. Extract financial data for charts
    console.log('Using GitHub AI to extract financial data...')
    const chartData = await githubAI.extractFinancialData(
      htmlContent,
      filing.ticker,
      filing.companyName
    )

    return NextResponse.json({
      success: true,
      data: {
        filing: {
          id: filing.id || `${filing.ticker}-${filing.formType}-${Date.now()}`,
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
        analysis: {
          id: `analysis-${Date.now()}`,
          summary: aiAnalysisResult.summary,
          keyFindings: aiAnalysisResult.keyFindings,
          strengths: aiAnalysisResult.strengths,
          weaknesses: aiAnalysisResult.weaknesses,
          risks: aiAnalysisResult.risks,
          opportunities: aiAnalysisResult.opportunities,
          overallScore: aiAnalysisResult.scores.overallScore,
          profitabilityScore: aiAnalysisResult.scores.profitabilityScore,
          liquidityScore: aiAnalysisResult.scores.liquidityScore,
          solvencyScore: aiAnalysisResult.scores.solvencyScore,
          recommendation: aiAnalysisResult.recommendation,
          confidenceScore: aiAnalysisResult.confidenceScore,
          targetPrice: aiAnalysisResult.targetPrice,
          priceRange: aiAnalysisResult.priceRange,
          revenue: aiAnalysisResult.financialMetrics.revenue,
          netIncome: aiAnalysisResult.financialMetrics.netIncome,
          totalAssets: aiAnalysisResult.financialMetrics.totalAssets,
          totalDebt: aiAnalysisResult.financialMetrics.totalDebt,
          cashAndEquivalents: aiAnalysisResult.financialMetrics.cashAndEquivalents,
        },
        chartData,
        metadata: {
          contentLength: htmlContent.length,
          tablesFound: financialTables.length,
          sectionsFound: textSections.length,
          analyzedLength: analyzedContent.length,
          processingTime
        }
      }
    })

  } catch (error) {
    console.error('Quick test analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze filing',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}