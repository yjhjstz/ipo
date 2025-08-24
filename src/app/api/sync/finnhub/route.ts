import { NextRequest, NextResponse } from 'next/server'
import { createSyncService } from '@/lib/data-sync'

// POST /api/sync/finnhub - Sync only US IPO data from Finnhub
export async function POST(_request: NextRequest) {
  try {
    const syncService = createSyncService()
    const result = await syncService.syncUsIpos()

    return NextResponse.json({
      success: result.success,
      data: result,
      message: `Finnhub sync completed. Added: ${result.added}, Updated: ${result.updated}, Skipped: ${result.skipped}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Finnhub sync failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Finnhub synchronization failed', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    )
  }
}

// GET /api/sync/finnhub - Get Finnhub sync status
export async function GET() {
  try {
    const syncService = createSyncService()
    const syncInfo = await syncService.getLastSyncInfo()
    const usInfo = syncInfo.find(info => info.market === 'US')
    
    return NextResponse.json({
      success: true,
      data: {
        market: 'US',
        source: 'Finnhub API',
        ...usInfo
      },
      message: 'Finnhub sync status retrieved successfully'
    })
  } catch (error) {
    console.error('Failed to get Finnhub sync info:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve Finnhub sync status' }, 
      { status: 500 }
    )
  }
}