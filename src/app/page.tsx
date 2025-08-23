'use client'

import { useEffect, useState } from 'react'
import { IpoStock } from '@/types/ipo'
import StockListAnalyticsStyle from '@/components/StockListAnalyticsStyle'
import AddStockForm from '@/components/AddStockForm'
import MarketNews from '@/components/MarketNews'
import MarketHolidays from '@/components/MarketHolidays'
import { Plus } from 'lucide-react'

export default function Home() {
  const [stocks, setStocks] = useState<IpoStock[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stocks')
      const data = await response.json()
      setStocks(data)
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStocks()
  }, [])

  const handleStockAdded = (newStock: IpoStock) => {
    setStocks(prev => [newStock, ...prev])
    setShowAddForm(false)
  }

  const handleStockDeleted = (deletedId: string) => {
    setStocks(prev => prev.filter(stock => stock.id !== deletedId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IPO Stock Analysis
          </h1>
          <p className="text-lg text-gray-600">
            Track and analyze upcoming IPOs from US and Hong Kong markets
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add New IPO Stock
          </button>
        </div>

        {showAddForm && (
          <div className="mb-8">
            <AddStockForm
              onStockAdded={handleStockAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading IPO stocks...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MarketNews limit={1} />
              <MarketHolidays compact={true} limit={3} />
            </div>
            <StockListAnalyticsStyle stocks={stocks} onStockDeleted={handleStockDeleted} />
          </div>
        )}
      </div>
    </div>
  )
}
