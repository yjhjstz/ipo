import { NextRequest, NextResponse } from 'next/server'
import { SECApiService, FilingContentAnalyzer } from '@/lib/external-apis'
import { GitHubAIService } from '@/lib/github-ai'
import { prisma } from '@/lib/db'

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

    console.log(`Getting content and analyzing ${filing.ticker} ${filing.formType}`)

    const secApiService = new SECApiService({ apiKey: SEC_API_KEY })
    
    // 1. Get filing content
    const htmlContent = await secApiService.getFilingContent(filing)
    
    // 2. Analyze content for AI processing
    const analyzedContent = FilingContentAnalyzer.summarizeForAI(htmlContent)
    const financialTables = FilingContentAnalyzer.extractFinancialTables(htmlContent)
    const textSections = FilingContentAnalyzer.extractTextSections(htmlContent)

    // 3. Save filing to database
    const savedFiling = await prisma.filingDocument.upsert({
      where: { 
        accessionNo: filing.accessionNo || filing.id 
      },
      update: {
        isContentFetched: true,
        contentLength: htmlContent.length,
        tablesFound: financialTables.length,
        sectionsFound: textSections.length
      },
      create: {
        accessionNo: filing.accessionNo || filing.id,
        cik: filing.cik || '0000000000',
        ticker: filing.ticker,
        companyName: filing.companyName,
        formType: filing.formType,
        filedAt: new Date(filing.filedAt),
        periodOfReport: filing.periodOfReport ? new Date(filing.periodOfReport) : null,
        linkToHtml: filing.linkToHtml || filing.linkToFilingDetails,
        linkToTxt: filing.linkToTxt,
        linkToFilingDetails: filing.linkToFilingDetails,
        description: filing.description,
        contentLength: htmlContent.length,
        tablesFound: financialTables.length,
        sectionsFound: textSections.length,
        isContentFetched: true
      }
    })

    // 4. Save filing content
    await prisma.filingContent.upsert({
      where: { filingId: savedFiling.id },
      update: {
        rawHtml: htmlContent,
        analyzedContent,
        financialTables: financialTables.map(table => JSON.stringify(table)),
        textSections: textSections.map(section => JSON.stringify(section)),
        processingTime: Date.now() - Date.now() // Will be updated with actual time
      },
      create: {
        filingId: savedFiling.id,
        rawHtml: htmlContent,
        analyzedContent,
        financialTables: financialTables.map(table => JSON.stringify(table)),
        textSections: textSections.map(section => JSON.stringify(section)),
        processingTime: 0
      }
    })

    // 5. Perform AI analysis
    console.log(`Starting AI analysis for ${filing.ticker} ${filing.formType}`)
    const startTime = Date.now()

    const githubAI = new GitHubAIService()
    const aiAnalysisResult = await githubAI.analyzeFinancialFiling(
      filing.ticker,
      filing.companyName,
      filing.formType,
      analyzedContent
    )

    const processingTime = Date.now() - startTime

    // 6. Save AI analysis
    const analysis = await prisma.filingAnalysis.create({
      data: {
        filingId: savedFiling.id,
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

    // 7. Update filing as analyzed
    await prisma.filingDocument.update({
      where: { id: savedFiling.id },
      data: { isAnalyzed: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        filing: {
          id: savedFiling.id,
          ticker: savedFiling.ticker,
          companyName: savedFiling.companyName,
          formType: savedFiling.formType,
          filedAt: savedFiling.filedAt
        },
        content: {
          raw: htmlContent,
          analyzed: analyzedContent,
          tables: financialTables.length,
          sections: textSections.map(s => s.section)
        },
        analysis: analysis,
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
    console.error('Complete filing analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze filing',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}