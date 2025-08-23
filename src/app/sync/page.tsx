'use client'

import DataSyncManager from '@/components/DataSyncManager'

export default function SyncPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Synchronization
          </h1>
          <p className="text-base text-gray-600">
            Manage automatic data feeds from Finnhub API (US IPOs)
          </p>
        </div>

        <DataSyncManager />

        {/* API Integration Details */}
        <div className="mt-8 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xl">🇺🇸</span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Finnhub API Integration</h2>
                <p className="text-sm text-gray-600">Real-time US IPO data • 60 calls/min • 30-day range • API Token auth</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">GET /api/sync</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">POST /api/sync</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">POST /api/sync/finnhub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}