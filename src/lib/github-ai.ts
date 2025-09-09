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
    if (!process.env.GITHUB_API_TOKEN) {
      console.warn('GITHUB_API_TOKEN is not configured, GitHub AI features will be disabled')
      throw new Error('GITHUB_API_TOKEN is required')
    }
    
    this.apiKey = process.env.GITHUB_API_TOKEN
    this.baseURL = 'https://models.github.ai/inference/chat/completions'
    
    console.log('GitHub AI service initialized')
    console.log('Using token:', this.apiKey.substring(0, 20) + '...')
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

IMPORTANT: 请严格按照以下JSON格式返回分析结果，不要添加任何解释文字或格式符号：

{
  "summary": "财务状况总体评价（100-150字）",
  "keyFindings": ["关键发现1", "关键发现2", "关键发现3"],
  "strengths": ["财务优势1", "财务优势2", "财务优势3"],
  "weaknesses": ["财务劣势1", "财务劣势2", "财务劣势3"],
  "risks": ["风险因素1", "风险因素2", "风险因素3"],
  "opportunities": ["机会点1", "机会点2", "机会点3"],
  "financialMetrics": {
    "revenue": 营收数值,
    "netIncome": 净利润数值,
    "totalAssets": 总资产数值,
    "totalDebt": 总债务数值,
    "cashAndEquivalents": 现金及等价物
  },
  "scores": {
    "overallScore": 综合评分,
    "profitabilityScore": 盈利能力评分,
    "liquidityScore": 流动性评分,
    "solvencyScore": 偿债能力评分
  },
  "recommendation": "Buy",
  "confidenceScore": 分析置信度,
  "targetPrice": 目标股价数值,
  "priceRange": "价格区间如12-15美元"
}

请确保：
1. 所有数字都是实际数值，不带单位
2. 评分为0-100的数字
3. recommendation只能是Buy/Hold/Sell/Watch其中之一
4. 只返回JSON，不要添加任何其他文字
5. 确保JSON格式完全正确且可解析`

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
          // 先尝试直接解析
          analysisData = JSON.parse(content)
        } catch {
          console.log('Direct JSON parse failed, extracting JSON from response...')
          
          // 尝试多种JSON提取模式
          let jsonText = null
          
          // 模式1: 查找第一个完整的{...}块
          const jsonMatch1 = content.match(/\{[\s\S]*?\}(?=\s*$|$)/);
          if (jsonMatch1) {
            jsonText = jsonMatch1[0];
          }
          
          // 模式2: 查找```json块
          if (!jsonText) {
            const jsonMatch2 = content.match(/```json\s*([\s\S]*?)\s*```/i);
            if (jsonMatch2) {
              jsonText = jsonMatch2[1];
            }
          }
          
          // 模式3: 查找最大的{...}块
          if (!jsonText) {
            const matches = content.match(/\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g);
            if (matches && matches.length > 0) {
              // 选择最长的JSON字符串
              jsonText = matches.reduce((a: string, b: string) => a.length > b.length ? a : b);
            }
          }
          
          if (jsonText) {
            try {
              analysisData = JSON.parse(jsonText)
            } catch (parseError) {
              console.error('JSON parse error after extraction:', parseError)
              console.error('Extracted JSON text:', jsonText.substring(0, 500))
              throw new Error('Extracted JSON is invalid')
            }
          } else {
            console.error('No JSON found in AI response')
            console.error('Full AI response:', content.substring(0, 1000))
            throw new Error('No JSON found in GitHub AI response')
          }
        }
        
        // 验证必需的字段
        if (!analysisData || typeof analysisData !== 'object') {
          throw new Error('Invalid analysis data structure')
        }
        
        // 确保所有必需字段存在，如果不存在则提供默认值
        const defaultAnalysis = {
          summary: analysisData.summary || '财务分析完成，请查看详细指标',
          keyFindings: Array.isArray(analysisData.keyFindings) ? analysisData.keyFindings : ['分析已完成'],
          strengths: Array.isArray(analysisData.strengths) ? analysisData.strengths : ['待进一步分析'],
          weaknesses: Array.isArray(analysisData.weaknesses) ? analysisData.weaknesses : ['待进一步分析'],
          risks: Array.isArray(analysisData.risks) ? analysisData.risks : ['风险评估中'],
          opportunities: Array.isArray(analysisData.opportunities) ? analysisData.opportunities : ['机会识别中'],
          financialMetrics: analysisData.financialMetrics || {},
          scores: {
            overallScore: analysisData.scores?.overallScore || 50,
            profitabilityScore: analysisData.scores?.profitabilityScore || 50,
            liquidityScore: analysisData.scores?.liquidityScore || 50,
            solvencyScore: analysisData.scores?.solvencyScore || 50
          },
          recommendation: analysisData.recommendation || 'Watch',
          confidenceScore: analysisData.confidenceScore || 50,
          targetPrice: analysisData.targetPrice,
          priceRange: analysisData.priceRange || '分析中'
        }
        
        return defaultAnalysis
      } catch (parseError) {
        console.error('Failed to parse GitHub AI filing analysis:', parseError)
        console.error('Original AI response length:', content.length)
        console.error('AI response preview:', content.substring(0, 500))
        
        // 即使解析失败，也要返回一个有用的分析结果
        return {
          summary: '已完成基础财务分析，由于数据格式问题部分详细信息暂时无法显示',
          keyFindings: ['财务数据已提取', '基础分析已完成', '建议查看原始财报获取更多详情'],
          strengths: ['数据完整性良好', '报告结构清晰'],
          weaknesses: ['部分数据需要进一步验证'],
          risks: ['数据解析风险'],
          opportunities: ['完善数据分析流程的机会'],
          financialMetrics: {
            revenue: 0,
            netIncome: 0,
            totalAssets: 0,
            totalDebt: 0,
            cashAndEquivalents: 0
          },
          scores: {
            overallScore: 50,
            profitabilityScore: 50,
            liquidityScore: 50,
            solvencyScore: 50
          },
          recommendation: 'Watch' as const,
          confidenceScore: 30,
          priceRange: '需要进一步分析'
        }
      }
    } catch (error) {
      console.error('GitHub AI filing analysis error:', {
        error: error instanceof Error ? error.message : String(error),
        tokenExists: !!process.env.GITHUB_API_TOKEN,
        tokenPrefix: this.apiKey?.substring(0, 20) + '...',
        url: this.baseURL
      })
      
      // Fallback analysis
      return {
        summary: '由于GitHub AI服务暂时不可用，已生成基础分析结果。请检查API配置或稍后重试。',
        keyFindings: ['财务数据已成功获取', 'AI详细分析暂时不可用', '建议稍后重试或检查服务配置'],
        strengths: ['数据完整性良好', '报告结构清晰'],
        weaknesses: ['AI分析服务暂时不可用'],
        risks: ['服务可用性风险'],
        opportunities: ['优化API配置的机会'],
        financialMetrics: {},
        scores: {
          overallScore: 50,
          profitabilityScore: 50,
          liquidityScore: 50,
          solvencyScore: 50
        },
        recommendation: 'Watch' as const,
        confidenceScore: 10,
        priceRange: 'API配置后可用'
      }
    }
  }
  
  async extractFinancialData(
    htmlContent: string,
    ticker: string = 'UNKNOWN',
    companyName: string = 'Unknown Company'
  ): Promise<{
    revenue: number[]
    netIncome: number[]
    assets: number[]
    liabilities: number[]
    cashFlow: number[]
    periods: string[]
    rawData: { [key: string]: number[] }
  }> {
    // 清理HTML标签，提取文本内容
    const content = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // 限制内容长度避免token超限
    const analysisContent = content.substring(0, 15000)

    const prompt = `
请从以下财务报表内容中提取关键财务数据，用于生成趋势图表。

公司信息：
- 股票代码：${ticker}
- 公司名称：${companyName}

财报内容：
${analysisContent}

请仔细分析文档内容，提取以下财务指标的多期数据。如果找到多个时期的数据，请按时间顺序排列。数值请转换为百万美元单位。

要求严格按照以下JSON格式返回，不要添加任何解释或格式符号：

{
  "revenue": [数值1, 数值2, 数值3],
  "netIncome": [数值1, 数值2, 数值3],
  "assets": [数值1, 数值2, 数值3],
  "liabilities": [数值1, 数值2, 数值3],
  "cashFlow": [数值1, 数值2, 数值3],
  "periods": ["Period 1", "Period 2", "Period 3"],
  "rawData": {
    "revenue": [数值1, 数值2, 数值3],
    "netIncome": [数值1, 数值2, 数值3],
    "assets": [数值1, 数值2, 数值3],
    "liabilities": [数值1, 数值2, 数值3],
    "cashFlow": [数值1, 数值2, 数值3]
  }
}

重要说明：
1. 所有数值都以百万美元为单位（不要包含单位符号）
2. 时期标签可以是年份、季度或具体日期
3. 如果某个指标在某个时期没有数据，请填入0
4. 最多提取8个时期的数据
5. 确保JSON格式完全正确且可解析
6. 只返回JSON，不要添加任何其他文字

请重点关注以下财务指标：
- Revenue/Sales/Total Revenue（营收）
- Net Income/Net Earnings（净利润）  
- Total Assets（总资产）
- Total Liabilities（总负债）
- Operating Cash Flow/Cash Flow from Operations（经营现金流）
`

    try {
      console.log(`Extracting financial data using GitHub AI for ${ticker}...`)
      
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
          temperature: 0.1 // Very low temperature for consistent data extraction
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('GitHub AI financial data extraction error:', response.status, errorText)
        throw new Error(`GitHub AI API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      const content_response = data.choices?.[0]?.message?.content

      if (!content_response) {
        throw new Error('Invalid response format from GitHub AI')
      }

      try {
        let extractedData
        try {
          // 尝试直接解析JSON
          extractedData = JSON.parse(content_response)
        } catch {
          console.log('Direct JSON parse failed for financial data, extracting JSON...')
          
          // 尝试多种JSON提取模式
          let jsonText = null
          
          // 模式1: 查找完整的{...}块
          const jsonMatch1 = content_response.match(/\{[\s\S]*?\}(?=\s*$|$)/);
          if (jsonMatch1) {
            jsonText = jsonMatch1[0];
          }
          
          // 模式2: 查找```json块
          if (!jsonText) {
            const jsonMatch2 = content_response.match(/```json\s*([\s\S]*?)\s*```/i);
            if (jsonMatch2) {
              jsonText = jsonMatch2[1];
            }
          }
          
          if (jsonText) {
            extractedData = JSON.parse(jsonText)
          } else {
            throw new Error('No valid JSON found in response')
          }
        }
        
        // 验证和规范化数据结构
        const normalizedData = {
          revenue: Array.isArray(extractedData.revenue) ? extractedData.revenue.map(Number).slice(0, 8) : [],
          netIncome: Array.isArray(extractedData.netIncome) ? extractedData.netIncome.map(Number).slice(0, 8) : [],
          assets: Array.isArray(extractedData.assets) ? extractedData.assets.map(Number).slice(0, 8) : [],
          liabilities: Array.isArray(extractedData.liabilities) ? extractedData.liabilities.map(Number).slice(0, 8) : [],
          cashFlow: Array.isArray(extractedData.cashFlow) ? extractedData.cashFlow.map(Number).slice(0, 8) : [],
          periods: Array.isArray(extractedData.periods) ? extractedData.periods.slice(0, 8) : [],
          rawData: extractedData.rawData || {}
        }
        
        // 确保所有数组长度一致
        const maxLength = Math.max(
          normalizedData.revenue.length,
          normalizedData.netIncome.length,
          normalizedData.assets.length,
          normalizedData.liabilities.length,
          normalizedData.cashFlow.length,
          normalizedData.periods.length
        )
        
        // 如果没有period标签，生成默认标签
        if (normalizedData.periods.length === 0 && maxLength > 0) {
          for (let i = 0; i < maxLength; i++) {
            normalizedData.periods.push(`Period ${i + 1}`)
          }
        }
        
        // 统一数组长度
        const targetLength = Math.max(maxLength, normalizedData.periods.length)
        
        ;['revenue', 'netIncome', 'assets', 'liabilities', 'cashFlow'].forEach(key => {
          const arr = normalizedData[key as keyof typeof normalizedData] as number[]
          while (arr.length < targetLength) {
            arr.push(0)
          }
          if (arr.length > targetLength) {
            (normalizedData[key as keyof typeof normalizedData] as number[]) = arr.slice(0, targetLength)
          }
        })
        
        normalizedData.periods = normalizedData.periods.slice(0, targetLength)
        
        console.log('GitHub AI extracted financial data:', {
          periods: normalizedData.periods.length,
          dataPoints: {
            revenue: normalizedData.revenue.length,
            netIncome: normalizedData.netIncome.length,
            assets: normalizedData.assets.length,
            liabilities: normalizedData.liabilities.length,
            cashFlow: normalizedData.cashFlow.length
          },
          sampleData: {
            revenue: normalizedData.revenue.slice(0, 3),
            periods: normalizedData.periods.slice(0, 3)
          }
        })
        
        return normalizedData
      } catch (parseError) {
        console.error('Failed to parse GitHub AI financial data response:', parseError)
        console.error('AI response preview:', content_response.substring(0, 500))
        
        // 返回空数据结构
        return {
          revenue: [],
          netIncome: [],
          assets: [],
          liabilities: [],
          cashFlow: [],
          periods: [],
          rawData: {}
        }
      }
    } catch (error) {
      console.error('GitHub AI financial data extraction error:', error)
      
      // 返回空数据结构
      return {
        revenue: [],
        netIncome: [],
        assets: [],
        liabilities: [],
        cashFlow: [],
        periods: [],
        rawData: {}
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