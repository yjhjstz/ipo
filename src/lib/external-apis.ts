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

// HKEX FINI API types (based on documentation research)
export interface HkexFiniIpoResponse {
  // Structure to be determined based on actual API documentation
  listings: Array<{
    symbol: string
    companyName: string
    listingDate: string
    offerPrice: number
    sharesOffered: number
    status: string
    sector: string
    // Add more fields as per FINI API specification
  }>
}

export interface HkexFiniApiConfig {
  baseUrl: string
  credentials: {
    clientId: string
    clientSecret: string
  }
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

// HKEX FINI API service
export class HkexFiniApiService {
  private config: HkexFiniApiConfig

  constructor(config: HkexFiniApiConfig) {
    this.config = config
  }

  async getAccessToken(): Promise<string> {
    // Implementation for OAuth2 or similar authentication
    const response = await fetch(`${this.config.baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.config.credentials.clientId,
        client_secret: this.config.credentials.clientSecret,
        grant_type: 'client_credentials'
      })
    })

    if (!response.ok) {
      throw new Error(`HKEX FINI auth error: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  }

  async getIpoListings(accessToken: string): Promise<HkexFiniIpoResponse> {
    // This endpoint structure is hypothetical - actual implementation 
    // would need the real FINI API documentation
    const response = await fetch(`${this.config.baseUrl}/api/v1/ipo/listings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HKEX FINI API error: ${response.status}`)
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

  static hkexToIpoStock(hkexData: HkexFiniIpoResponse['listings'][0]) {
    return {
      symbol: hkexData.symbol,
      companyName: hkexData.companyName,
      market: 'HK' as Market,
      expectedPrice: hkexData.offerPrice,
      sharesOffered: hkexData.sharesOffered,
      ipoDate: new Date(hkexData.listingDate),
      status: this.mapHkexStatus(hkexData.status),
      sector: hkexData.sector,
      underwriters: [], // FINI API structure to be determined
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

  private static mapHkexStatus(hkexStatus: string): IpoStatus {
    // Map HKEX statuses to our enum - exact mapping depends on FINI API specification
    switch (hkexStatus?.toLowerCase()) {
      case 'pending': return 'UPCOMING'
      case 'pricing': return 'PRICING'  
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