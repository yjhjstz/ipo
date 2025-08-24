import { NextRequest, NextResponse } from 'next/server'
import { createSyncService } from '@/lib/data-sync'

// POST /api/sync/scheduled - Endpoint for scheduled tasks (called by external cron or scheduler)
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized source (optional security measure)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const syncService = createSyncService()
    
    // Run sync for US market
    const results = await syncService.syncAllData()
    
    // Log the results
    console.log('Scheduled IPO data sync completed:', {
      timestamp: new Date().toISOString(),
      results
    })

    return NextResponse.json({
      success: true,
      message: 'Scheduled sync completed successfully',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Scheduled sync failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Scheduled sync failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// GET /api/sync/scheduled - Health check for the scheduled endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    message: 'Scheduled sync endpoint is available',
    timestamp: new Date().toISOString()
  })
}