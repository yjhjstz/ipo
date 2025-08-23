'use client'

import DataSyncManager from '@/components/DataSyncManager'

export default function SyncPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Data Synchronization
          </h1>
          <p className="text-lg text-gray-600">
            Manage automatic data feeds from Finnhub API (US IPOs) and HKEX FINI API (Hong Kong IPOs)
          </p>
        </div>

        <DataSyncManager />

        {/* API Documentation Section */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">API Integration Details</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Finnhub API */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇺🇸</span>
                <h3 className="text-xl font-semibold text-gray-900">Finnhub API</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Endpoint:</span>
                  <span className="font-mono text-gray-800">/calendar/ipo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate Limit:</span>
                  <span className="font-medium">60 calls/minute</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data Range:</span>
                  <span className="font-medium">Next 30 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Authentication:</span>
                  <span className="font-medium">API Token</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Features:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Real-time IPO calendar data</li>
                  <li>• Price range and expected pricing</li>
                  <li>• Share offering information</li>
                  <li>• Exchange and listing dates</li>
                </ul>
              </div>
            </div>

            {/* HKEX FINI API */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇭🇰</span>
                <h3 className="text-xl font-semibold text-gray-900">HKEX FINI API</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform:</span>
                  <span className="font-mono text-gray-800">Digital IPO Settlement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Settlement:</span>
                  <span className="font-medium">T+2 Timeline</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Authentication:</span>
                  <span className="font-medium">OAuth2 Client Credentials</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Access:</span>
                  <span className="font-medium">Registration Required</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Features:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• End-to-end settlement process</li>
                  <li>• Digital placee list management</li>
                  <li>• Real-time status updates</li>
                  <li>• Regulatory compliance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available API Endpoints</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span><span className="text-green-600 font-bold">GET</span> /api/sync</span>
                  <span className="text-gray-500">Get sync status</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span><span className="text-blue-600 font-bold">POST</span> /api/sync</span>
                  <span className="text-gray-500">Sync all markets</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span><span className="text-blue-600 font-bold">POST</span> /api/sync/finnhub</span>
                  <span className="text-gray-500">Sync US IPOs only</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span><span className="text-blue-600 font-bold">POST</span> /api/sync/hkex</span>
                  <span className="text-gray-500">Sync HK IPOs only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}