// External API integrations for IPO data

// Finnhub API types
export interface FinnhubIpoResponse {
  ipoCalendar: Array<{
    date: string
    exchange: string
    name: string
    numberOfShares: number
    price: string
    status: string
    symbol: string
    totalSharesValue: number
  }>
}

export interface FinnhubApiConfig {
  baseUrl: string
  apiKey: string
}


// Finnhub API service
export class FinnhubApiService {
  private config: FinnhubApiConfig

  constructor(config: FinnhubApiConfig) {
    this.config = config
  }

  async getIpoCalendar(from: string, to: string): Promise<FinnhubIpoResponse> {
    const url = `${this.config.baseUrl}/calendar/ipo?from=${from}&to=${to}&token=${this.config.apiKey}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }
}


// Data transformation utilities
export class IpoDataTransformer {
  static finnhubToIpoStock(finnhubData: FinnhubIpoResponse['ipoCalendar'][0]) {
    const ipoDate = new Date(finnhubData.date);
    
    return {
      symbol: finnhubData.symbol,
      companyName: finnhubData.name,
      market: 'US' as const,
      expectedPrice: this.parsePriceString(finnhubData.price),
      priceRange: finnhubData.price,
      sharesOffered: finnhubData.numberOfShares,
      ipoDate: ipoDate,
      status: this.mapFinnhubStatus(finnhubData.status, ipoDate) as 'UPCOMING' | 'PRICING' | 'LISTED' | 'WITHDRAWN' | 'POSTPONED',
      underwriters: [], // Finnhub doesn't provide underwriter info
      // Additional fields can be mapped as needed
    }
  }


  private static parsePriceString(priceStr: string): number | undefined {
    if (!priceStr || priceStr === '') return undefined
    
    // Handle ranges like "$10-$15" -> take midpoint
    const rangeMatch = priceStr.match(/\$?(\d+(?:\.\d+)?)-\$?(\d+(?:\.\d+)?)/)
    if (rangeMatch) {
      const low = parseFloat(rangeMatch[1])
      const high = parseFloat(rangeMatch[2])
      return (low + high) / 2
    }

    // Handle single price like "$12.50"
    const singleMatch = priceStr.match(/\$?(\d+(?:\.\d+)?)/)
    if (singleMatch) {
      return parseFloat(singleMatch[1])
    }

    return undefined
  }

  private static mapFinnhubStatus(finnhubStatus: string, ipoDate: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    const ipoDayOnly = new Date(ipoDate);
    ipoDayOnly.setHours(0, 0, 0, 0);

    // If IPO date is in the past, determine status based on Finnhub status
    if (ipoDayOnly < today) {
      switch (finnhubStatus?.toLowerCase()) {
        case 'priced': return 'LISTED'  // If it was priced and date passed, it's likely listed
        case 'filed': return 'LISTED'   // If it was filed and date passed, it's likely listed
        case 'expected': return 'LISTED' // If it was expected and date passed, it's likely listed
        case 'withdrawn': return 'WITHDRAWN'
        case 'postponed': return 'POSTPONED'
        default: return 'LISTED'
      }
    }

    // If IPO date is today or future, use current status
    switch (finnhubStatus?.toLowerCase()) {
      case 'filed': return 'UPCOMING'
      case 'expected': return 'UPCOMING'
      case 'priced': return 'PRICING'
      case 'listed': return 'LISTED'
      case 'withdrawn': return 'WITHDRAWN'
      case 'postponed': return 'POSTPONED'
      default: return 'UPCOMING'
    }
  }

}

// SEC API types and service
export interface SECFiling {
  id: string
  accessionNo: string
  cik: string
  ticker: string
  companyName: string
  formType: string
  filedAt: string
  linkToTxt: string
  linkToHtml: string
  linkToFilingDetails: string
  description?: string
  periodOfReport?: string
}

export interface SECApiConfig {
  apiKey: string
}

export interface SECSearchQuery {
  ticker?: string
  cik?: string
  formType: string
  from?: string
  size?: string
  sort?: Array<{ filedAt: { order: string } }>
}

export interface SECSearchResponse {
  filings: SECFiling[]
  total: {
    value: number
    relation: string
  }
}

// SEC API service
export class SECApiService {
  private config: SECApiConfig
  private secApi: {
    queryApi: {
      getFilings: (query: {
        query: string
        from: string
        size: string
        sort: Array<{ filedAt: { order: string } }>
      }) => Promise<{
        filings: Array<{
          accessionNo?: string
          id?: string
          cik: string
          ticker: string
          companyName: string
          formType: string
          filedAt: string
          linkToTxt?: string
          linkToHtml: string
          linkToFilingDetails: string
          description?: string
          periodOfReport?: string
        }>
        total?: { value: number; relation: string }
      }>
    }
  }

  constructor(config: SECApiConfig) {
    this.config = config
    // Initialize sec-api
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const secApiLib = require('sec-api')
    secApiLib.setApiKey(config.apiKey)
    this.secApi = secApiLib
  }

  async searchFilings(query: SECSearchQuery): Promise<SECSearchResponse> {
    try {
      // Build query string
      let queryString = ''
      if (query.ticker) {
        queryString += `ticker:${query.ticker}`
      }
      if (query.cik) {
        queryString += query.ticker ? ` AND cik:${query.cik}` : `cik:${query.cik}`
      }
      if (query.formType) {
        queryString += ` AND formType:"${query.formType}"`
      }

      const searchQuery = {
        query: queryString,
        from: query.from || "0",
        size: query.size || "10",
        sort: query.sort || [{ filedAt: { order: "desc" } }]
      }

      console.log('SEC API search query:', searchQuery)
      
      const result = await this.secApi.queryApi.getFilings(searchQuery)
      
      if (!result || !result.filings) {
        throw new Error('Invalid response from SEC API')
      }

      return {
        filings: result.filings.map((filing: {
          accessionNo?: string
          id?: string
          cik: string
          ticker: string
          companyName: string
          formType: string
          filedAt: string
          linkToTxt?: string
          linkToHtml: string
          linkToFilingDetails: string
          description?: string
          periodOfReport?: string
        }) => ({
          id: filing.accessionNo || filing.id || '',
          accessionNo: filing.accessionNo || '',
          cik: filing.cik,
          ticker: filing.ticker,
          companyName: filing.companyName,
          formType: filing.formType,
          filedAt: filing.filedAt,
          linkToTxt: filing.linkToTxt || '',
          linkToHtml: filing.linkToHtml,
          linkToFilingDetails: filing.linkToFilingDetails,
          description: filing.description,
          periodOfReport: filing.periodOfReport
        })),
        total: result.total || { value: result.filings.length, relation: 'eq' }
      }
    } catch (error) {
      console.error('SEC API search error:', error)
      throw new Error(`SEC API search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getFilingContent(filing: SECFiling): Promise<string> {
    try {
      // Get HTML content from filing URL
      const url = filing.linkToFilingDetails || filing.linkToHtml
      if (!url) {
        throw new Error('No HTML URL available for this filing')
      }

      console.log('Fetching filing content from:', url)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEC-Filing-Bot/1.0; +https://your-domain.com/contact)'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const content = await response.text()
      return content
    } catch (error) {
      console.error('Filing content fetch error:', error)
      throw new Error(`Failed to fetch filing content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getCompanyFilings(ticker: string, formTypes: string[] = ['10-K', '10-Q'], limit: number = 10): Promise<SECFiling[]> {
    try {
      const allFilings: SECFiling[] = []
      
      for (const formType of formTypes) {
        const result = await this.searchFilings({
          ticker,
          formType,
          size: Math.ceil(limit / formTypes.length).toString()
        })
        
        allFilings.push(...result.filings)
      }

      // Sort by filing date (newest first) and limit
      return allFilings
        .sort((a, b) => new Date(b.filedAt).getTime() - new Date(a.filedAt).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Company filings fetch error:', error)
      throw new Error(`Failed to fetch company filings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Filing content analysis utilities
export class FilingContentAnalyzer {
  static extractFinancialTables(htmlContent: string): string[] {
    const tables: string[] = []
    
    try {
      // Extract tables that likely contain financial data
      const tableMatches = htmlContent.match(/<table[^>]*>[\s\S]*?<\/table>/gi)
      
      if (tableMatches) {
        for (const table of tableMatches) {
          // Look for financial keywords in table content
          if (this.containsFinancialKeywords(table)) {
            tables.push(table)
          }
        }
      }
    } catch (error) {
      console.error('Table extraction error:', error)
    }
    
    return tables
  }

  static extractTextSections(htmlContent: string): { section: string, content: string }[] {
    const sections: { section: string, content: string }[] = []
    
    try {
      // Remove HTML tags and extract meaningful text sections
      const cleanText = htmlContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Split into sections based on common SEC filing structure
      const sectionKeywords = [
        'CONSOLIDATED STATEMENTS OF OPERATIONS',
        'CONSOLIDATED BALANCE SHEETS',
        'CONSOLIDATED STATEMENTS OF CASH FLOWS',
        'CONSOLIDATED STATEMENTS OF STOCKHOLDERS',
        'BUSINESS',
        'RISK FACTORS',
        'RESULTS OF OPERATIONS',
        'FINANCIAL CONDITION',
        'LIQUIDITY AND CAPITAL RESOURCES'
      ]

      for (const keyword of sectionKeywords) {
        const regex = new RegExp(`(${keyword}[\\s\\S]{0,5000})`, 'i')
        const match = cleanText.match(regex)
        if (match) {
          sections.push({
            section: keyword,
            content: match[1].substring(0, 2000) // Limit content length
          })
        }
      }
    } catch (error) {
      console.error('Text section extraction error:', error)
    }
    
    return sections
  }

  static containsFinancialKeywords(text: string): boolean {
    const financialKeywords = [
      'revenue', 'income', 'assets', 'liabilities', 'equity',
      'cash flow', 'stockholders', 'earnings', 'net income',
      'operating income', 'total assets', 'current assets',
      'accounts receivable', 'inventory', 'property', 'debt'
    ]
    
    const lowercaseText = text.toLowerCase()
    return financialKeywords.some(keyword => lowercaseText.includes(keyword))
  }

  static summarizeForAI(htmlContent: string): string {
    try {
      const tables = this.extractFinancialTables(htmlContent)
      const sections = this.extractTextSections(htmlContent)
      
      let summary = 'SEC FILING ANALYSIS CONTENT:\n\n'
      
      // Add financial tables (simplified)
      if (tables.length > 0) {
        summary += 'FINANCIAL TABLES:\n'
        tables.slice(0, 3).forEach((table, index) => {
          const cleanTable = table
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 1000)
          summary += `Table ${index + 1}: ${cleanTable}\n\n`
        })
      }
      
      // Add text sections
      if (sections.length > 0) {
        summary += 'KEY SECTIONS:\n'
        sections.forEach(({ section, content }) => {
          summary += `${section}:\n${content}\n\n`
        })
      }
      
      return summary.substring(0, 15000) // Limit total content for AI
    } catch (error) {
      console.error('AI summary generation error:', error)
      return htmlContent.substring(0, 5000) // Fallback to raw content
    }
  }
}

// Rate limiting utility
export class RateLimiter {
  private requests: number[] = []
  
  constructor(private maxRequests: number, private timeWindow: number) {}
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.timeWindow)
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.timeWindow - (now - oldestRequest)
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    this.requests.push(now)
  }
}