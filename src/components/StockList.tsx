'use client'

import { IpoStock } from '@/types/ipo'
import { Trash2, Calendar, DollarSign, Building2, Globe } from 'lucide-react'

interface StockListProps {
  stocks: IpoStock[]
  onStockDeleted: (id: string) => void
}

export default function StockList({ stocks, onStockDeleted }: StockListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stock?')) return

    try {
      const response = await fetch(`/api/stocks/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onStockDeleted(id)
      } else {
        alert('Failed to delete stock')
      }
    } catch (error) {
      console.error('Failed to delete stock:', error)
      alert('Failed to delete stock')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800'
      case 'PRICING': return 'bg-yellow-100 text-yellow-800'
      case 'LISTED': return 'bg-green-100 text-green-800'
      case 'WITHDRAWN': return 'bg-red-100 text-red-800'
      case 'POSTPONED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMarketFlag = (market: string) => {
    return market === 'US' ? '🇺🇸' : '🇭🇰'
  }

  if (stocks.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No IPO stocks</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your first IPO stock.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stocks.map((stock) => (
        <div key={stock.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMarketFlag(stock.market)}</span>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{stock.symbol}</h3>
                <p className="text-sm text-gray-600">{stock.companyName}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(stock.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Delete stock"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="mb-4">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stock.status)}`}>
              {stock.status}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {stock.expectedPrice && (
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span>Expected: ${stock.expectedPrice}</span>
              </div>
            )}
            
            {stock.priceRange && (
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span>Range: {stock.priceRange}</span>
              </div>
            )}

            {stock.ipoDate && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>IPO: {new Date(stock.ipoDate).toLocaleDateString()}</span>
              </div>
            )}

            {stock.sector && (
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                <span>{stock.sector}</span>
              </div>
            )}

            {stock.website && (
              <div className="flex items-center gap-2">
                <Globe size={16} />
                <a 
                  href={stock.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Website
                </a>
              </div>
            )}
          </div>

          {stock.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-700 line-clamp-3">
                {stock.description}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}