import { NextRequest, NextResponse } from 'next/server'
import { GitHubAIService } from '@/lib/github-ai'
import { FilingContentAnalyzer } from '@/lib/external-apis'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filingId, forceReanalysis = false } = body

    if (!filingId) {
      return NextResponse.json(
        { error: 'Filing ID is required' },
        { status: 400 }
      )
    }

    // Get filing document with content
    const filing = await prisma.filingDocument.findUnique({
      where: { id: filingId },
      include: {
        content: true,
        analyses: {
          where: { analysisType: 'financial' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!filing) {
      return NextResponse.json(
        { error: 'Filing not found' },
        { status: 404 }
      )
    }

    // Check if analysis already exists and is recent
    if (!forceReanalysis && filing.analyses.length > 0) {
      const existingAnalysis = filing.analyses[0]
      const analysisAge = Date.now() - existingAnalysis.createdAt.getTime()
      const oneDayInMs = 24 * 60 * 60 * 1000

      if (analysisAge < oneDayInMs) {
        return NextResponse.json({
          success: true,
          data: {
            analysis: existingAnalysis,
            fromCache: true
          }
        })
      }
    }

    if (!filing.content) {
      return NextResponse.json(
        { error: 'Filing content not available' },
        { status: 404 }
      )
    }

    console.log(`Starting AI analysis for ${filing.ticker} ${filing.formType}`)

    const startTime = Date.now()

    // Use the analyzed content for AI processing
    const contentForAI = filing.content.analyzedContent || 
                        FilingContentAnalyzer.summarizeForAI(filing.content.rawHtml)

    // Perform GitHub AI analysis
    const githubAI = new GitHubAIService()
    const aiAnalysisResult = await githubAI.analyzeFinancialFiling(
      filing.ticker,
      filing.companyName,
      filing.formType,
      contentForAI
    )

    const processingTime = Date.now() - startTime

    // Save analysis to database
    const analysis = await prisma.filingAnalysis.create({
      data: {
        filingId: filing.id,
        analysisType: 'financial',
        aiModel: 'github-openai/gpt-4.1',
        summary: aiAnalysisResult.summary,
        keyFindings: aiAnalysisResult.keyFindings,
        strengths: aiAnalysisResult.strengths,
        weaknesses: aiAnalysisResult.weaknesses,
        risks: aiAnalysisResult.risks,
        opportunities: aiAnalysisResult.opportunities,
        
        // Financial metrics
        revenue: aiAnalysisResult.financialMetrics.revenue,
        netIncome: aiAnalysisResult.financialMetrics.netIncome,
        totalAssets: aiAnalysisResult.financialMetrics.totalAssets,
        totalDebt: aiAnalysisResult.financialMetrics.totalDebt,
        cashAndEquivalents: aiAnalysisResult.financialMetrics.cashAndEquivalents,
        
        // Scores
        overallScore: aiAnalysisResult.scores.overallScore,
        profitabilityScore: aiAnalysisResult.scores.profitabilityScore,
        liquidityScore: aiAnalysisResult.scores.liquidityScore,
        solvencyScore: aiAnalysisResult.scores.solvencyScore,
        
        // Recommendation
        recommendation: aiAnalysisResult.recommendation,
        confidenceScore: aiAnalysisResult.confidenceScore,
        targetPrice: aiAnalysisResult.targetPrice,
        priceRange: aiAnalysisResult.priceRange,
        
        processingTime
      }
    })

    // Update filing as analyzed
    await prisma.filingDocument.update({
      where: { id: filing.id },
      data: { isAnalyzed: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        processingTime,
        filing: {
          ticker: filing.ticker,
          companyName: filing.companyName,
          formType: filing.formType,
          filedAt: filing.filedAt
        }
      }
    })

  } catch (error) {
    console.error('Filing analysis API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze filing',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}