import { prisma } from '@/lib/db'
import { 
  FinnhubApiService, 
  HkexFiniApiService, 
  IpoDataTransformer,
  RateLimiter,
  FinnhubApiConfig,
  HkexFiniApiConfig 
} from './external-apis'
import { CreateIpoStock } from '@/types/ipo'

export interface SyncResult {
  success: boolean
  processed: number
  added: number
  updated: number
  skipped: number
  errors: string[]
}

export class IpoDataSyncService {
  private finnhubService: FinnhubApiService
  private hkexService: HkexFiniApiService
  private finnhubRateLimiter: RateLimiter
  private hkexRateLimiter: RateLimiter

  constructor(
    finnhubConfig: FinnhubApiConfig,
    hkexConfig: HkexFiniApiConfig
  ) {
    this.finnhubService = new FinnhubApiService(finnhubConfig)
    this.hkexService = new HkexFiniApiService(hkexConfig)
    
    // Finnhub: 60 calls per minute
    this.finnhubRateLimiter = new RateLimiter(60, 60000)
    
    // HKEX: Conservative rate limiting (to be adjusted based on actual limits)
    this.hkexRateLimiter = new RateLimiter(30, 60000)
  }

  async syncAllData(): Promise<{ us: SyncResult; hk: SyncResult }> {
    const [usResult, hkResult] = await Promise.allSettled([
      this.syncUsIpos(),
      this.syncHkIpos()
    ])

    return {
      us: usResult.status === 'fulfilled' 
        ? usResult.value 
        : { success: false, processed: 0, added: 0, updated: 0, skipped: 0, errors: [usResult.reason.message] },
      hk: hkResult.status === 'fulfilled' 
        ? hkResult.value 
        : { success: false, processed: 0, added: 0, updated: 0, skipped: 0, errors: [hkResult.reason.message] }
    }
  }

  async syncUsIpos(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      processed: 0,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: []
    }

    try {
      await this.finnhubRateLimiter.waitIfNeeded()

      // Get IPO data for next 30 days (expand range for testing)
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days ago
      const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now

      const finnhubData = await this.finnhubService.getIpoCalendar(from, to)

      for (const ipoData of finnhubData.ipoCalendar) {
        try {
          result.processed++
          
          // Skip records without required fields or withdrawn/invalid entries
          if (!ipoData.symbol || !ipoData.name || 
              ipoData.symbol === null || ipoData.name === null ||
              ipoData.symbol.trim() === '' || ipoData.name.trim() === '' ||
              ipoData.status === 'withdrawn') {
            result.skipped++
            continue
          }
          
          // Additional data quality check - skip if no meaningful data
          if (!ipoData.numberOfShares && !ipoData.price && !ipoData.totalSharesValue) {
            result.skipped++
            continue
          }
          
          const transformedData = IpoDataTransformer.finnhubToIpoStock(ipoData)
          const syncResult = await this.upsertIpoStock(transformedData)
          
          if (syncResult === 'added') result.added++
          else if (syncResult === 'updated') result.updated++
          else result.skipped++
          
        } catch (error) {
          result.errors.push(`Error processing ${ipoData.symbol || 'unknown'}: ${error.message}`)
        }
      }

      result.success = true
    } catch (error) {
      result.errors.push(`US IPO sync failed: ${error.message}`)
    }

    return result
  }

  async syncHkIpos(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      processed: 0,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: []
    }

    try {
      await this.hkexRateLimiter.waitIfNeeded()

      // Get access token for HKEX FINI API
      const accessToken = await this.hkexService.getAccessToken()
      
      // Get HK IPO data
      const hkexData = await this.hkexService.getIpoListings(accessToken)

      for (const ipoData of hkexData.listings) {
        try {
          result.processed++
          
          const transformedData = IpoDataTransformer.hkexToIpoStock(ipoData)
          const syncResult = await this.upsertIpoStock(transformedData)
          
          if (syncResult === 'added') result.added++
          else if (syncResult === 'updated') result.updated++
          else result.skipped++
          
        } catch (error) {
          result.errors.push(`Error processing ${ipoData.symbol}: ${error.message}`)
        }
      }

      result.success = true
    } catch (error) {
      result.errors.push(`HK IPO sync failed: ${error.message}`)
    }

    return result
  }

  private async upsertIpoStock(stockData: Partial<CreateIpoStock>): Promise<'added' | 'updated' | 'skipped'> {
    if (!stockData.symbol || !stockData.companyName) {
      throw new Error('Missing required fields: symbol or companyName')
    }

    // Check if stock already exists
    const existingStock = await prisma.ipoStock.findFirst({
      where: {
        symbol: stockData.symbol,
        market: stockData.market
      }
    })

    if (existingStock) {
      // Check if data has changed
      const hasChanges = this.hasSignificantChanges(existingStock, stockData)
      
      if (!hasChanges) {
        return 'skipped'
      }

      // Update existing stock
      await prisma.ipoStock.update({
        where: { id: existingStock.id },
        data: {
          ...stockData,
          ipoDate: stockData.ipoDate ? new Date(stockData.ipoDate) : null,
          updatedAt: new Date()
        }
      })

      return 'updated'
    } else {
      // Create new stock
      await prisma.ipoStock.create({
        data: {
          symbol: stockData.symbol,
          companyName: stockData.companyName,
          market: stockData.market || 'US',
          status: stockData.status || 'UPCOMING',
          expectedPrice: stockData.expectedPrice,
          priceRange: stockData.priceRange,
          sharesOffered: stockData.sharesOffered,
          ipoDate: stockData.ipoDate ? new Date(stockData.ipoDate) : null,
          sector: stockData.sector,
          industry: stockData.industry,
          description: stockData.description,
          underwriters: stockData.underwriters || [],
          marketCap: stockData.marketCap,
          revenue: stockData.revenue,
          netIncome: stockData.netIncome,
          employees: stockData.employees,
          website: stockData.website
        }
      })

      return 'added'
    }
  }

  private hasSignificantChanges(existing: Record<string, unknown>, newData: Record<string, unknown>): boolean {
    const fieldsToCheck = [
      'expectedPrice', 'priceRange', 'sharesOffered', 'ipoDate', 
      'status', 'sector', 'industry', 'description', 'marketCap',
      'revenue', 'netIncome', 'employees', 'website'
    ]

    for (const field of fieldsToCheck) {
      if (existing[field] !== newData[field]) {
        // Handle date comparison
        if (field === 'ipoDate') {
          const existingDate = existing[field]?.getTime()
          const newDate = newData[field] ? new Date(newData[field]).getTime() : null
          if (existingDate !== newDate) return true
        } else {
          return true
        }
      }
    }

    return false
  }

  async getLastSyncInfo() {
    // Get count of stocks by source and last update time
    const stats = await prisma.ipoStock.groupBy({
      by: ['market'],
      _count: { id: true },
      _max: { updatedAt: true }
    })

    return stats.map(stat => ({
      market: stat.market,
      count: stat._count.id,
      lastUpdate: stat._max.updatedAt
    }))
  }
}

// Factory function to create sync service with environment config
export function createSyncService(): IpoDataSyncService {
  const finnhubConfig: FinnhubApiConfig = {
    baseUrl: process.env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1',
    apiKey: process.env.FINNHUB_API_KEY || ''
  }

  const hkexConfig: HkexFiniApiConfig = {
    baseUrl: process.env.HKEX_FINI_BASE_URL || 'https://api.hkex.com.hk/fini',
    credentials: {
      clientId: process.env.HKEX_FINI_CLIENT_ID || '',
      clientSecret: process.env.HKEX_FINI_CLIENT_SECRET || ''
    }
  }

  return new IpoDataSyncService(finnhubConfig, hkexConfig)
}