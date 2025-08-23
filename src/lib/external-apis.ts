// External API integrations for IPO data
import { IpoStatus, Market } from '@/types/ipo'

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
    return {
      symbol: finnhubData.symbol,
      companyName: finnhubData.name,
      market: 'US' as Market,
      expectedPrice: this.parsePriceString(finnhubData.price),
      priceRange: finnhubData.price,
      sharesOffered: finnhubData.numberOfShares,
      ipoDate: new Date(finnhubData.date),
      status: this.mapFinnhubStatus(finnhubData.status),
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

  private static mapFinnhubStatus(finnhubStatus: string): IpoStatus {
    switch (finnhubStatus?.toLowerCase()) {
      case 'filed': return 'UPCOMING'
      case 'priced': return 'PRICING'
      case 'listed': return 'LISTED'
      case 'withdrawn': return 'WITHDRAWN'
      case 'postponed': return 'POSTPONED'
      default: return 'UPCOMING'
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