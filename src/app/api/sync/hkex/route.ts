import { NextRequest, NextResponse } from 'next/server'
import { createSyncService } from '@/lib/data-sync'

// POST /api/sync/hkex - Sync only Hong Kong IPO data from HKEX FINI
export async function POST(_request: NextRequest) {
  try {
    const syncService = createSyncService()
    const result = await syncService.syncHkIpos()

    return NextResponse.json({
      success: result.success,
      data: result,
      message: `HKEX FINI sync completed. Added: ${result.added}, Updated: ${result.updated}, Skipped: ${result.skipped}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('HKEX FINI sync failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'HKEX FINI synchronization failed', 
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}

// GET /api/sync/hkex - Get HKEX FINI sync status
export async function GET() {
  try {
    const syncService = createSyncService()
    const syncInfo = await syncService.getLastSyncInfo()
    const hkInfo = syncInfo.find(info => info.market === 'HK')
    
    return NextResponse.json({
      success: true,
      data: {
        market: 'HK',
        source: 'HKEX FINI API',
        ...hkInfo
      },
      message: 'HKEX FINI sync status retrieved successfully'
    })
  } catch (error) {
    console.error('Failed to get HKEX sync info:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve HKEX sync status' }, 
      { status: 500 }
    )
  }
}