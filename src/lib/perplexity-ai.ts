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

export class PerplexityAIService {
  private baseUrl: string
  private apiKey: string

  constructor() {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is required')
    }
    
    this.baseUrl = process.env.PERPLEXITY_BASE_URL || 'https://api.perplexity.ai'
    this.apiKey = process.env.PERPLEXITY_API_KEY
    
    console.log('Perplexity AI service initialized with base URL:', this.baseUrl)
  }

  async analyzeStock(stockData: Record<string, unknown>): Promise<StockAnalysis> {
    const prompt = `
作为一位专业的IPO投资分析师，请分析以下IPO股票并提供详细的投资分析：

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

请提供JSON格式的分析，包含以下字段（请用中文）：
{
  "summary": "简要分析总结（80-120字）",
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

请严格按照JSON格式返回，不要包含任何其他内容或解释。`

    try {
      console.log('Sending request to Perplexity AI for stock analysis...')
      console.log('API Key prefix:', this.apiKey.substring(0, 10) + '...')
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Perplexity API error:', response.status, errorText)
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Perplexity AI response received:', JSON.stringify(data, null, 2))

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content
        
        try {
          // 尝试提取JSON内容
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          const jsonString = jsonMatch ? jsonMatch[0] : content
          const analysisData = JSON.parse(jsonString)
          
          return {
            symbol: stockData.symbol as string,
            companyName: stockData.companyName as string,
            analysis: analysisData
          }
        } catch (parseError) {
          console.error('Failed to parse Perplexity response:', content)
          throw new Error('Invalid JSON response from Perplexity')
        }
      }

      throw new Error('Invalid response format from Perplexity')
    } catch (error) {
      console.error('Perplexity AI analysis error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Fallback analysis
      return {
        symbol: stockData.symbol as string,
        companyName: stockData.companyName as string,
        analysis: {
          summary: '由于技术原因，暂时无法生成详细分析。建议关注公司基本面和市场环境变化。',
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
    const validPrices = ipoData.filter(stock => typeof stock.expectedPrice === 'number' && stock.expectedPrice > 0)
    const avgPrice = validPrices.length > 0 
      ? validPrices.reduce((sum, stock) => sum + (typeof stock.expectedPrice === 'number' ? stock.expectedPrice : 0), 0) / validPrices.length 
      : 0

    const prompt = `
作为一位专业的IPO市场分析师，请基于以下IPO市场数据提供综合市场分析：

市场概况：
- 总IPO数量：${ipoData.length}
- 即将上市：${upcomingCount}
- 正在定价：${pricingCount}  
- 平均预期价格：$${avgPrice.toFixed(2)}

主要公司样本：
${ipoData.slice(0, 10).map(stock => 
  `- ${stock.symbol} (${stock.companyName}): ${stock.expectedPrice ? `$${stock.expectedPrice}` : '待定'} - ${stock.status}`
).join('\n')}

请提供JSON格式的市场分析（请用中文）：
{
  "marketOverview": "市场整体概况分析（120-180字）",
  "trends": ["趋势1", "趋势2", "趋势3"],
  "opportunities": ["机会1", "机会2", "机会3"],
  "risks": ["风险1", "风险2", "风险3"],
  "outlook": "Bullish/Bearish/Neutral"
}

请严格按照JSON格式返回，不要包含任何其他内容或解释。`

    try {
      console.log('Sending request to Perplexity AI for market analysis...')
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Perplexity API error:', response.status, errorText)
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Perplexity AI market response:', JSON.stringify(data, null, 2))

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content
        
        try {
          // 尝试提取JSON内容
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          const jsonString = jsonMatch ? jsonMatch[0] : content
          return JSON.parse(jsonString)
        } catch (parseError) {
          console.error('Failed to parse Perplexity market response:', content)
          throw new Error('Invalid JSON response from Perplexity')
        }
      }

      throw new Error('Invalid response format from Perplexity')
    } catch (error) {
      console.error('Perplexity AI market analysis error:', error)
      
      // Fallback analysis
      return {
        marketOverview: '当前IPO市场活动频繁，投资者需要谨慎评估各项目的基本面和估值合理性。',
        trends: ['待分析'],
        opportunities: ['待分析'],
        risks: ['待分析'],
        outlook: 'Neutral' as const
      }
    }
  }
}

export function createPerplexityAIService(): PerplexityAIService {
  return new PerplexityAIService()
}