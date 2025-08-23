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

  async analyzeStock(stockData: any): Promise<StockAnalysis> {
    const prompt = `
分析以下IPO股票数据，提供详细的投资分析：

公司信息：
- 股票代码：${stockData.symbol}
- 公司名称：${stockData.companyName}
- 市场：${stockData.market === 'US' ? '美国' : '香港'}
- 预期价格：${stockData.expectedPrice ? `$${stockData.expectedPrice}` : '待定'}
- 价格区间：${stockData.priceRange || '待定'}
- 发行股数：${stockData.sharesOffered || '待定'}
- IPO日期：${stockData.ipoDate ? new Date(stockData.ipoDate).toLocaleDateString('zh-CN') : '待定'}
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
    "expectedGrowth": "预期增长率",
    "valuation": "估值水平"
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
        const analysisData = JSON.parse(content)
        
        return {
          symbol: stockData.symbol,
          companyName: stockData.companyName,
          analysis: analysisData
        }
      } catch (parseError) {
        console.error('Failed to parse GitHub AI response:', content)
        throw new Error('Invalid JSON response from GitHub AI')
      }
    } catch (error) {
      console.error('GitHub AI analysis error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // Fallback analysis
      return {
        symbol: stockData.symbol,
        companyName: stockData.companyName,
        analysis: {
          summary: '由于技术原因，暂时无法生成详细分析',
          pros: ['待分析'],
          cons: ['待分析'], 
          riskLevel: 'Medium' as const,
          recommendation: 'Watch' as const,
          keyMetrics: {
            marketCap: '待分析',
            expectedGrowth: '待分析',
            valuation: '待分析'
          }
        }
      }
    }
  }

  async analyzeMarket(ipoData: any[]): Promise<MarketAnalysis> {
    const upcomingCount = ipoData.filter(stock => stock.status === 'UPCOMING').length
    const pricingCount = ipoData.filter(stock => stock.status === 'PRICING').length
    const avgPrice = ipoData.reduce((sum, stock) => sum + (stock.expectedPrice || 0), 0) / ipoData.length

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

      return JSON.parse(content)
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
}

export function createGitHubAIService(): GitHubAIService {
  return new GitHubAIService()
}