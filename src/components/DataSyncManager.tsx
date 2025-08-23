'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Download, Clock, CheckCircle, XCircle } from 'lucide-react'

interface SyncInfo {
  market: string
  count: number
  lastUpdate: string | null
}

interface SyncResult {
  success: boolean
  processed: number
  added: number
  updated: number
  skipped: number
  errors: string[]
}

export default function DataSyncManager() {
  const [syncInfo, setSyncInfo] = useState<SyncInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  useEffect(() => {
    fetchSyncInfo()
  }, [])

  const fetchSyncInfo = async () => {
    try {
      const response = await fetch('/api/sync')
      const data = await response.json()
      if (data.success) {
        setSyncInfo(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch sync info:', error)
    }
  }

  const handleSync = async () => {
    setLoading(true)
    setLastSyncResult(null)

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      
      if (result.success) {
        setLastSyncResult(result.data)
        
        // Refresh sync info
        await fetchSyncInfo()
      } else {
        alert(`Sync failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      alert('Sync failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const SyncResultCard = ({ title, result }: { title: string, result: SyncResult | null }) => {
    if (!result) return null

    return (
      <div className="bg-white rounded-lg shadow p-3 border">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Processed:</span>
            <span className="ml-1 font-medium">{result.processed}</span>
          </div>
          <div>
            <span className="text-gray-500">Added:</span>
            <span className="ml-1 font-medium text-green-600">{result.added}</span>
          </div>
          <div>
            <span className="text-gray-500">Updated:</span>
            <span className="ml-1 font-medium text-blue-600">{result.updated}</span>
          </div>
          <div>
            <span className="text-gray-500">Skipped:</span>
            <span className="ml-1 font-medium text-gray-600">{result.skipped}</span>
          </div>
        </div>

        {result.errors.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded">
            <h5 className="text-xs font-medium text-red-800 mb-1">Errors:</h5>
            <ul className="text-xs text-red-700 list-disc list-inside">
              {result.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Data Synchronization</h3>
          <button
            onClick={() => fetchSyncInfo()}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Refresh sync info"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {syncInfo.map((info) => (
            <div key={info.market} className="p-3 border rounded">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">
                  🇺🇸 US Market
                </h4>
                <span className="text-sm font-semibold text-blue-600">
                  {info.count} IPOs
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {info.lastUpdate 
                  ? new Date(info.lastUpdate).toLocaleString()
                  : 'Never synced'
                }
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSync()}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            {loading ? 'Syncing...' : 'Sync US Market'}
          </button>
        </div>
      </div>

      {/* Sync Results */}
      {lastSyncResult && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Last Sync Results</h3>
          <SyncResultCard 
            title="🇺🇸 US Market (Finnhub)" 
            result={lastSyncResult} 
          />
        </div>
      )}
    </div>
  )
}