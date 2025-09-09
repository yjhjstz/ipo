export interface StockAnalysis {
  symbol: string
  companyName: string
  analysis: {
    summary: string
    pros: string[]
    cons: string[]
    riskLevel: 'Low' | 'Medium' | 'High'
    recommendation: 'Buy' | 'Hold' | 'Sell' | 'Watch'
    priceTarget?: number
    keyMetrics?: {
      marketCap?: string
      peRatio?: string
      expectedGrowth?: string
    }
  }
}

export interface MarketAnalysis {
  marketOverview: string
  trends: string[]
  opportunities: string[]
  risks: string[]
  outlook: 'Bullish' | 'Bearish' | 'Neutral'
}

export interface FilingAnalysisResult {
  summary: string
  keyFindings: string[]
  strengths: string[]
  weaknesses: string[]
  risks: string[]
  opportunities: string[]
  financialMetrics: {
    revenue?: number
    netIncome?: number
    totalAssets?: number
    totalDebt?: number
    cashAndEquivalents?: number
  }
  scores: {
    overallScore: number
    profitabilityScore: number
    liquidityScore: number
    solvencyScore: number
  }
  recommendation: 'Buy' | 'Hold' | 'Sell' | 'Watch'
  confidenceScore: number
  targetPrice?: number
  priceRange?: string
}

export class GitHubAIService {
  private apiKey: string
  private baseURL: string

  constructor() {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN is required')
    }
    
    this.apiKey = process.env.GITHUB_TOKEN
    this.baseURL = 'https://models.github.ai/inference/chat/completions'
    
    console.log('GitHub AI service initialized')
  }

  async analyzeStock(stockData: Record<string, unknown>): Promise<StockAnalysis> {
    const prompt = `
分析以下IPO股票数据，提供详细的投资分析：

公司信息：
- 股票代码：${stockData.symbol}
- 公司名称：${stockData.companyName}
- 市场：${stockData.market === 'US' ? '美国' : '香港'}
- 预期价格：${stockData.expectedPrice ? `$${stockData.expectedPrice}` : '待定'}
- 价格区间：${stockData.priceRange || '待定'}
- 发行股数：${stockData.sharesOffered || '待定'}
- IPO日期：${stockData.ipoDate && typeof stockData.ipoDate === 'string' ? new Date(stockData.ipoDate).toLocaleDateString('zh-CN') : '待定'}
- 状态：${stockData.status}
- 行业：${stockData.sector || '未知'}

请提供以下格式的分析（请用中文回答）：

{
  "summary": "简要分析总结（50-100字）",
  "pros": ["优势1", "优势2", "优势3"],
  "cons": ["劣势1", "劣势2", "劣势3"], 
  "riskLevel": "Low/Medium/High",
  "recommendation": "Buy/Hold/Sell/Watch",
  "priceTarget": 预期目标价格（数字），
  "keyMetrics": {
    "marketCap": "预估市值",
    "expectedGrowth": "预期增长率"
  }
}

请严格按照JSON格式返回，不要包含其他内容。
`

    try {
      console.log('Sending request to GitHub AI for stock analysis...')
      console.log('Model: openai/gpt-4.1')
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4.1',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('GitHub AI API error:', response.status, errorText)
        throw new Error(`GitHub AI API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('GitHub AI response received:', JSON.stringify(data, null, 2))

      const content = data.choices?.[0]?.message?.content
      if (!content) {
        throw new Error('Invalid response format from GitHub AI')
      }

      try {
        // 尝试直接解析JSON
        let analysisData
        try {
          analysisData = JSON.parse(content)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          console.log('Direct JSON parse failed, trying to extract JSON...')
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            analysisData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        }
        
        return {
          symbol: stockData.symbol as string,
          companyName: stockData.companyName as string,
          analysis: analysisData
        }
      } catch {
        console.error('Failed to parse GitHub AI response:', content)
        throw new Error('Invalid JSON response from GitHub AI')
      }
    } catch (error) {
      console.error('GitHub AI analysis error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Fallback analysis
      return {
        symbol: stockData.symbol as string,
        companyName: stockData.companyName as string,
        analysis: {
          summary: '由于技术原因，暂时无法生成详细分析',
          pros: ['待分析'],
          cons: ['待分析'], 
          riskLevel: 'Medium' as const,
          recommendation: 'Watch' as const,
          keyMetrics: {
            marketCap: '待分析',
            expectedGrowth: '待分析'
          }
        }
      }
    }
  }

  async analyzeMarket(ipoData: Record<string, unknown>[]): Promise<MarketAnalysis> {
    const upcomingCount = ipoData.filter(stock => stock.status === 'UPCOMING').length
    const pricingCount = ipoData.filter(stock => stock.status === 'PRICING').length
    const avgPrice = ipoData.length > 0 
      ? ipoData.reduce((sum, stock) => sum + (typeof stock.expectedPrice === 'number' ? stock.expectedPrice : 0), 0) / ipoData.length 
      : 0

    const prompt = `
基于以下IPO市场数据，提供市场趋势分析：

市场概况：
- 总IPO数量：${ipoData.length}
- 即将上市：${upcomingCount}
- 正在定价：${pricingCount}  
- 平均预期价格：$${avgPrice.toFixed(2)}

主要公司：
${ipoData.slice(0, 10).map(stock => 
  `- ${stock.symbol} (${stock.companyName}): ${stock.expectedPrice ? `$${stock.expectedPrice}` : '待定'}`
).join('\n')}

请提供以下格式的市场分析（请用中文回答）：

{
  "marketOverview": "市场整体概况分析（100-150字）",
  "trends": ["趋势1", "趋势2", "趋势3"],
  "opportunities": ["机会1", "机会2", "机会3"],
  "risks": ["风险1", "风险2", "风险3"],
  "outlook": "Bullish/Bearish/Neutral"
}

请严格按照JSON格式返回，不要包含其他内容。
`

    try {
      console.log('Sending request to GitHub AI for market analysis...')
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4.1',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('GitHub AI API error:', response.status, errorText)
        throw new Error(`GitHub AI API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('GitHub AI market analysis response:', JSON.stringify(data, null, 2))

      const content = data.choices?.[0]?.message?.content
      if (!content) {
        throw new Error('Invalid response format from GitHub AI')
      }

      try {
        // 尝试直接解析JSON
        let analysisData
        try {
          analysisData = JSON.parse(content)
        } catch {
          // 如果直接解析失败，尝试提取JSON部分
          console.log('Direct JSON parse failed, trying to extract JSON...')
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            analysisData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        }

        return analysisData
      } catch {
        console.error('Failed to parse GitHub AI market response:', content)
        throw new Error('Invalid JSON response from GitHub AI')
      }
    } catch (error) {
      console.error('GitHub AI market analysis error:', error)
      
      // Fallback analysis
      return {
        marketOverview: '由于技术原因，暂时无法生成市场分析',
        trends: ['待分析'],
        opportunities: ['待分析'],
        risks: ['待分析'],
        outlook: 'Neutral' as const
      }
    }
  }

  async analyzeFinancialFiling(
    ticker: string, 
    companyName: string, 
    formType: string,
    filingContent: string
  ): Promise<FilingAnalysisResult> {
    const prompt = `
请分析以下SEC财报文件内容，提供详细的财务分析和投资建议。

公司信息：
- 股票代码：${ticker}
- 公司名称：${companyName}
- 财报类型：${formType}

财报内容：
${filingContent}

请按以下JSON格式返回分析结果：

{
  "summary": "财务状况总体评价（100-150字）",
  "keyFindings": ["关键发现1", "关键发现2", "关键发现3"],
  "strengths": ["财务优势1", "财务优势2", "财务优势3"],
  "weaknesses": ["财务劣势1", "财务劣势2", "财务劣势3"],
  "risks": ["风险因素1", "风险因素2", "风险因素3"],
  "opportunities": ["机会点1", "机会点2", "机会点3"],
  "financialMetrics": {
    "revenue": 营收数值(单位：百万美元),
    "netIncome": 净利润数值(单位：百万美元),
    "totalAssets": 总资产数值(单位：百万美元),
    "totalDebt": 总债务数值(单位：百万美元),
    "cashAndEquivalents": 现金及等价物(单位：百万美元)
  },
  "scores": {
    "overallScore": 综合评分(0-100),
    "profitabilityScore": 盈利能力评分(0-100),
    "liquidityScore": 流动性评分(0-100),
    "solvencyScore": 偿债能力评分(0-100)
  },
  "recommendation": "Buy/Hold/Sell/Watch",
  "confidenceScore": 分析置信度(0-100),
  "targetPrice": 目标股价(美元),
  "priceRange": "价格区间如12-15美元"
}

请确保：
1. 所有数字都是实际从财报中提取的
2. 评分基于具体财务指标
3. 分析结果客观准确
4. 严格按照JSON格式返回
`

    try {
      console.log(`Analyzing ${formType} filing for ${ticker}...`)
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4.1',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 2000,
          temperature: 0.3 // Lower temperature for more consistent financial analysis
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('GitHub AI filing analysis error:', response.status, errorText)
        throw new Error(`GitHub AI API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('Invalid response format from GitHub AI')
      }

      try {
        let analysisData
        try {
          analysisData = JSON.parse(content)
        } catch {
          console.log('Direct JSON parse failed, extracting JSON from response...')
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            analysisData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No JSON found in GitHub AI response')
          }
        }
        
        return analysisData
      } catch (error) {
        console.error('Failed to parse GitHub AI filing analysis:', content)
        throw new Error('Invalid JSON response from GitHub AI')
      }
    } catch (error) {
      console.error('GitHub AI filing analysis error:', error)
      
      // Fallback analysis
      return {
        summary: '由于技术原因，暂时无法生成详细的财务分析',
        keyFindings: ['分析处理中'],
        strengths: ['待分析'],
        weaknesses: ['待分析'],
        risks: ['待分析'],
        opportunities: ['待分析'],
        financialMetrics: {},
        scores: {
          overallScore: 50,
          profitabilityScore: 50,
          liquidityScore: 50,
          solvencyScore: 50
        },
        recommendation: 'Watch' as const,
        confidenceScore: 10,
        priceRange: '待分析'
      }
    }
  }

  async analyzeQuarterlyTrends(
    ticker: string,
    companyName: string,
    recentFilings: Array<{ formType: string, filedAt: string, summary?: string }>
  ): Promise<{
    trendAnalysis: string
    quarterlyGrowth: string[]
    outlook: 'Positive' | 'Negative' | 'Stable'
    keyTrends: string[]
  }> {
    const prompt = `
基于以下公司的多季度财报信息，分析财务趋势和发展方向：

公司：${ticker} - ${companyName}

最近财报：
${recentFilings.map(f => `- ${f.formType} (${f.filedAt}): ${f.summary || '财务数据'}`).join('\n')}

请分析：
1. 收入和盈利趋势
2. 财务状况变化
3. 业务发展方向
4. 未来展望

返回JSON格式：
{
  "trendAnalysis": "趋势分析总结（100-200字）",
  "quarterlyGrowth": ["Q1变化", "Q2变化", "Q3变化"],
  "outlook": "Positive/Negative/Stable",
  "keyTrends": ["关键趋势1", "关键趋势2", "关键趋势3"]
}
`

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4.1',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.4
        })
      })

      if (!response.ok) {
        throw new Error(`GitHub AI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      
      if (!content) {
        throw new Error('Invalid response format from GitHub AI')
      }

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content)
      } catch {
        throw new Error('Invalid JSON in trend analysis response')
      }
    } catch (error) {
      console.error('GitHub AI trend analysis error:', error)
      
      return {
        trendAnalysis: '趋势分析暂时不可用',
        quarterlyGrowth: ['数据处理中'],
        outlook: 'Stable' as const,
        keyTrends: ['待分析']
      }
    }
  }
}

export function createGitHubAIService(): GitHubAIService {
  return new GitHubAIService()
}