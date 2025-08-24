import { NextResponse } from 'next/server'
import { createSyncService } from '@/lib/data-sync'

// GET /api/sync - Get sync status and last sync information
export async function GET() {
  try {
    const syncService = createSyncService()
    const syncInfo = await syncService.getLastSyncInfo()
    
    return NextResponse.json({
      success: true,
      data: syncInfo,
      message: 'Sync status retrieved successfully'
    })
  } catch (error) {
    console.error('Failed to get sync info:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve sync status' }, 
      { status: 500 }
    )
  }
}

// POST /api/sync - Trigger manual data synchronization
export async function POST() {
  try {
    const syncService = createSyncService()
    
    // Sync US market only
    const result = await syncService.syncAllData()

    const response = {
      success: true,
      data: result,
      message: 'Data synchronization completed',
      timestamp: new Date().toISOString()
    }

    // Log sync results
    console.log('IPO Data Sync Results:', JSON.stringify(response, null, 2))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Sync failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Data synchronization failed', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    )
  }
}