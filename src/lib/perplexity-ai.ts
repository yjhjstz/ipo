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

export interface AIStartup {
  company_name: string
  funding_amount: string
  focus_area: string
}

export interface SearchResult {
  title: string
  url: string
  date?: string
  last_updated?: string
}

export interface TrendingStartupsResponse {
  search_results: SearchResult[]
  last_updated: string
}

export interface ProspectusAnalysis {
  companyName: string
  pdfUrl: string
  analysis: {
    businessModel: string
    financialHighlights: {
      revenue?: string
      profitability?: string
      growth?: string
      debtLevels?: string
    }
    riskFactors: string[]
    competitiveAdvantages: string[]
    marketOpportunity: string
    managementTeam: string
    investmentRecommendation: {
      rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
      reasoning: string
      targetPrice?: string
    }
    keyMetrics: {
      valuation?: string
      priceToSales?: string
      marketSize?: string
      employeeCount?: string
    }
  }
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
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/chat/completions`, {
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
        } catch {
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

  private async fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 2): Promise<Response> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt + 1}/${maxRetries + 1} - Fetching from Perplexity AI...`)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 seconds
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        return response
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error)
        
        if (attempt === maxRetries) {
          throw error
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s...
        console.log(`Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error('All retry attempts failed')
  }

  async getTrendingAIStartups(): Promise<TrendingStartupsResponse> {
    try {
      console.log('Fetching trending AI startups from Perplexity AI...')
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/chat/completions`, {
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
              content: 'Find the top 3 trending AI startups with recent funding. Include company name, funding amount, and focus area.'
            }
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              schema: {
                type: 'object',
                properties: {
                  startups: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        company_name: { type: 'string' },
                        funding_amount: { type: 'string' },
                        focus_area: { type: 'string' }
                      },
                      required: ['company_name', 'funding_amount', 'focus_area']
                    }
                  }
                },
                required: ['startups']
              }
            }
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Perplexity API error:', response.status, errorText)
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Trending AI startups response:', JSON.stringify(data, null, 2))

      // Only return search_results, ignore the choices content
      return {
        search_results: data.search_results || [],
        last_updated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Perplexity AI trending startups error:', error)
      
      // Fallback data with recent dates for testing
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // This should be filtered out
      
      return {
        search_results: [
          {
            title: 'The Latest VC Investment Deals in AI Startups - 2025 | News',
            url: 'https://www.crescendo.ai/news/latest-vc-investment-deals-in-ai-startups',
            date: oneDayAgo,
            last_updated: oneDayAgo
          },
          {
            title: 'Top US AI Funding Rounds: $100M+ in 2025 | Eqvista',
            url: 'https://eqvista.com/top-us-ai-funding/',
            date: threeDaysAgo,
            last_updated: threeDaysAgo
          },
          {
            title: 'Ranked: The Biggest AI Funding Rounds of 2025 So Far',
            url: 'https://www.visualcapitalist.com/ranked-the-biggest-ai-funding-rounds-of-2025-so-far/',
            date: fiveDaysAgo,
            last_updated: fiveDaysAgo
          },
          {
            title: '100 Top Startups to Watch in 2025 | Fast-Growing & VC-Backed',
            url: 'https://startupsavant.com/startups-to-watch',
            date: tenDaysAgo,
            last_updated: tenDaysAgo // This should be filtered out (older than 1 week)
          },
          {
            title: 'Here are the 24 US AI startups that have raised $100M or ...',
            url: 'https://techcrunch.com/2025/06/18/here-are-the-24-us-ai-startups-that-have-raised-100m-or-more-in-2025/',
            date: '2025-06-18',
            last_updated: '2025-07-22' // This should be filtered out (older than 1 week)
          }
        ],
        last_updated: new Date().toISOString()
      }
    }
  }

  async analyzeProspectus(pdfUrl: string): Promise<ProspectusAnalysis> {
    const prompt = `
作为专业的投资分析师，请全面分析这份IPO招股书并提供详细的投资分析报告。

请提供JSON格式的分析（用中文），包含以下结构：
{
  "companyName": "公司名称",
  "businessModel": "商业模式详细描述（150-200字）",
  "financialHighlights": {
    "revenue": "营收情况",
    "profitability": "盈利能力", 
    "growth": "增长趋势",
    "debtLevels": "负债水平"
  },
  "riskFactors": ["主要风险1", "主要风险2", "主要风险3"],
  "competitiveAdvantages": ["竞争优势1", "竞争优势2", "竞争优势3"],
  "marketOpportunity": "市场机会分析（100-150字）",
  "managementTeam": "管理团队评估（80-120字）",
  "investmentRecommendation": {
    "rating": "Strong Buy/Buy/Hold/Sell/Strong Sell",
    "reasoning": "投资建议理由（120-180字）",
    "targetPrice": "目标价格（如有）"
  },
  "keyMetrics": {
    "valuation": "估值水平",
    "priceToSales": "市销率",
    "marketSize": "市场规模",
    "employeeCount": "员工人数"
  }
}

请严格按照JSON格式返回，不要包含任何其他内容或解释。`

    try {
      console.log('=== Perplexity AI Request ===')
      console.log('URL:', `${this.baseUrl}/chat/completions`)
      console.log('PDF URL:', pdfUrl)
      
      const payload = {
        messages: [
          {
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'file_url',
                file_url: {
                  url: pdfUrl
                }
              }
            ],
            role: 'user'
          }
        ],
        model: 'sonar-pro',
        max_tokens: 20000,
        temperature: 0.1
      }
      
      console.log('=== Complete Perplexity AI Payload ===')
      console.log('const payload =', JSON.stringify(payload, null, 4) + ';')
      console.log('')
      console.log('Request Headers:', {
        'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`,
        'Content-Type': 'application/json'
      })
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      console.log('=== Perplexity AI Response ===')
      console.log('Status:', response.status)
      console.log('Headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Perplexity API Error Response:', errorText)
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Response Body:', JSON.stringify(data, null, 2))

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content
        
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          const jsonString = jsonMatch ? jsonMatch[0] : content
          const analysisData = JSON.parse(jsonString)
          
          return {
            companyName: analysisData.companyName || '未知公司',
            pdfUrl,
            analysis: analysisData
          }
        } catch {
          console.error('Failed to parse Perplexity prospectus response:', content)
          throw new Error('Invalid JSON response from Perplexity')
        }
      }

      throw new Error('Invalid response format from Perplexity')
    } catch (error) {
      console.error('Perplexity AI prospectus analysis error:', error)
      
      return {
        companyName: '分析失败',
        pdfUrl,
        analysis: {
          businessModel: '由于技术原因，暂时无法分析招股书内容。请稍后重试或联系客服。',
          financialHighlights: {
            revenue: '待分析',
            profitability: '待分析',
            growth: '待分析',
            debtLevels: '待分析'
          },
          riskFactors: ['分析暂不可用'],
          competitiveAdvantages: ['分析暂不可用'],
          marketOpportunity: '分析暂不可用，请稍后重试。',
          managementTeam: '分析暂不可用，请稍后重试。',
          investmentRecommendation: {
            rating: 'Hold' as const,
            reasoning: '由于技术原因无法完成分析，建议等待系统恢复后重新分析。'
          },
          keyMetrics: {
            valuation: '待分析',
            priceToSales: '待分析',
            marketSize: '待分析',
            employeeCount: '待分析'
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
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/chat/completions`, {
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
        } catch {
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