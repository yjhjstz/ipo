import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { GitHubAIService } from '@/lib/github-ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileInfo } = body

    if (!fileInfo || !fileInfo.fileName) {
      return NextResponse.json({ error: 'File information is required' }, { status: 400 })
    }

    console.log(`Analyzing uploaded file: ${fileInfo.originalName}`)

    // 使用临时目录路径
    const filePath = path.join(tmpdir(), 'ipo-uploads', fileInfo.fileName)
    let content = ''

    // 根据文件类型解析内容
    if (fileInfo.fileName.endsWith('.html') || fileInfo.fileName.endsWith('.htm')) {
      // 解析HTML文件
      const htmlContent = readFileSync(filePath, 'utf-8')
      // 简单清理HTML标签，提取文本内容
      content = htmlContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    } else {
      return NextResponse.json({ 
        error: '只支持HTML格式的财务报表文件' 
      }, { status: 400 })
    }

    if (!content) {
      return NextResponse.json({ 
        error: 'Could not extract content from file' 
      }, { status: 400 })
    }

    console.log(`Extracted content length: ${content.length} characters`)

    // 限制内容长度以适应AI处理
    const analysisContent = content.substring(0, 8000)
    
    // 使用GitHub AI分析
    const githubAI = new GitHubAIService()
    const startTime = Date.now()

    // 创建模拟的filing对象供AI分析使用
    const ticker = extractTickerFromContent(content)
    const companyName = extractCompanyNameFromContent(content)
    const formType = detectFormType(content)
    
    console.log('Debug - Extracted info:')
    console.log('- Ticker:', ticker)
    console.log('- Company Name:', companyName)
    console.log('- Form Type:', formType)
    console.log('- Content preview (first 1000 chars):', content.substring(0, 1000))
    
    const mockFiling = {
      ticker: ticker || 'UNKNOWN',
      companyName: companyName || 'Unknown Company',
      formType: formType
    }

    const aiAnalysisResult = await githubAI.analyzeFinancialFiling(
      mockFiling.ticker,
      mockFiling.companyName,
      mockFiling.formType,
      analysisContent
    )

    const processingTime = Date.now() - startTime

    // 读取原始HTML内容用于下载
    const rawHtmlContent = readFileSync(filePath, 'utf-8')

    // 提取数值数据用于图表
    console.log('Using GitHub AI to extract financial data...')
    const chartData = await githubAI.extractFinancialData(
      rawHtmlContent,
      mockFiling.ticker,
      mockFiling.companyName
    )

    return NextResponse.json({
      success: true,
      data: {
        fileInfo: {
          ...fileInfo,
          contentLength: content.length,
          analysisLength: analysisContent.length
        },
        content: {
          raw: rawHtmlContent, // 返回完整的原始HTML内容
          analyzed: analysisContent
        },
        analysis: {
          id: `uploaded-analysis-${Date.now()}`,
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
          processingTime,
          detectedTicker: mockFiling.ticker,
          detectedCompany: mockFiling.companyName,
          detectedFormType: mockFiling.formType
        }
      }
    })

  } catch (error) {
    console.error('File analysis error:', error)
    return NextResponse.json({
      error: 'Failed to analyze file',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 辅助函数：从内容中提取股票代码
function extractTickerFromContent(content: string): string | null {
  const tickerPatterns = [
    // 常见格式
    /ticker[:\s]+([A-Z]{2,5})/i,
    /symbol[:\s]+([A-Z]{2,5})/i,
    /trading symbol[:\s]+([A-Z]{2,5})/i,
    /\(([A-Z]{2,5})\)/,
    /NYSE[:\s]+([A-Z]{2,5})/i,
    /NASDAQ[:\s]+([A-Z]{2,5})/i,
    // PDF特定格式
    /Stock Symbol[:\s]+([A-Z]{2,5})/i,
    /Common Stock[:\s]+([A-Z]{2,5})/i,
    /Ticker[:\s]*Symbol[:\s]*([A-Z]{2,5})/i,
    // 更宽松的模式
    /\b([A-Z]{2,5})\s+(?:Common|Stock|Inc|Corp|Company)/i,
    /NYSE:\s*([A-Z]{2,5})/i,
    /NASDAQ:\s*([A-Z]{2,5})/i
  ]

  for (const pattern of tickerPatterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      const ticker = match[1].toUpperCase()
      // 过滤掉常见的非股票代码
      if (!['THE', 'INC', 'LLC', 'CORP', 'CO', 'AND', 'FOR', 'WITH'].includes(ticker)) {
        console.log(`Found ticker: ${ticker} using pattern: ${pattern}`)
        return ticker
      }
    }
  }

  return null
}

// 辅助函数：从内容中提取公司名称
function extractCompanyNameFromContent(content: string): string | null {
  const companyPatterns = [
    // 标准SEC文档格式
    /^([A-Z][A-Za-z\s&.,]+(?:Inc\.|Corporation|Corp\.|Company|Co\.|LLC|Ltd\.)?)/m,
    /company name[:\s]+([A-Za-z\s&.,]+(?:Inc\.|Corporation|Corp\.|Company|Co\.|LLC|Ltd\.))/i,
    /issuer[:\s]+([A-Za-z\s&.,]+(?:Inc\.|Corporation|Corp\.|Company|Co\.|LLC|Ltd\.))/i,
    // SEC文档特定格式
    /UNITED STATES[^]*?COMMISSION[^]*?([A-Z][A-Za-z\s&.,]+(?:Inc\.|Corporation|Corp\.|Company|Co\.|LLC|Ltd\.))/i,
    /Form\s+\d+[-]?[KQ][^]*?([A-Z][A-Za-z\s&.,]+(?:Inc\.|Corporation|Corp\.|Company|Co\.|LLC|Ltd\.))/i,
    // PDF特定模式
    /([A-Z][A-Za-z\s&.,]{10,50}(?:Inc\.|Corporation|Corp\.|Company|Co\.|LLC|Ltd\.))/,
    // 更简单的模式
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc\.|Corporation|Corp\.|Company|Co\.|LLC|Ltd\.))/
  ]

  for (const pattern of companyPatterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      const companyName = match[1].trim()
      // 过滤掉太短或明显不是公司名的结果
      if (companyName.length > 5 && companyName.length < 100) {
        console.log(`Found company: ${companyName} using pattern: ${pattern}`)
        return companyName
      }
    }
  }

  return null
}

// 辅助函数：检测表格类型
function detectFormType(content: string): string {
  
  const formPatterns = [
    { pattern: /form\s*10[-]?k/i, type: '10-K' },
    { pattern: /form\s*10[-]?q/i, type: '10-Q' },
    { pattern: /form\s*8[-]?k/i, type: '8-K' },
    { pattern: /form\s*def\s*14a/i, type: 'DEF 14A' },
    { pattern: /proxy\s*statement/i, type: 'DEF 14A' },
    { pattern: /annual\s*report/i, type: '10-K' },
    { pattern: /quarterly\s*report/i, type: '10-Q' },
    { pattern: /current\s*report/i, type: '8-K' }
  ]
  
  for (const { pattern, type } of formPatterns) {
    if (pattern.test(content)) {
      console.log(`Found form type: ${type} using pattern: ${pattern}`)
      return type
    }
  }
  
  console.log('No specific form type detected, defaulting to Financial Report')
  return 'Financial Report'
}