'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IpoStock } from '@/types/ipo'
import { Calendar, TrendingUp, Building2, DollarSign, Globe, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'

interface StockListAnalyticsStyleProps {
  stocks: IpoStock[]
  onStockDeleted: (id: string) => void
}

export default function StockListAnalyticsStyle({ stocks, onStockDeleted }: StockListAnalyticsStyleProps) {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  
  // Filter out stocks with PRICING status
  const filteredStocks = stocks.filter(stock => stock.status !== 'PRICING')

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this stock?')) {
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
        alert('Error deleting stock')
      }
    }
  }

  const formatPrice = (price?: number) => {
    return price ? `$${price.toFixed(2)}` : '未公布'
  }

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`
    }
    return `$${marketCap.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
      case 'PRICING':
        return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300'
      case 'LISTED':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
      case 'WITHDRAWN':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
      case 'POSTPONED':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-500'
      case 'PRICING': return 'bg-orange-500'
      case 'LISTED': return 'bg-green-500'
      case 'WITHDRAWN': return 'bg-red-500'
      case 'POSTPONED': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UPCOMING': return '即将上市'
      case 'PRICING': return '定价中'
      case 'LISTED': return '已上市'
      case 'WITHDRAWN': return '已撤回'
      case 'POSTPONED': return '已延期'
      default: return status
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
      <div className="px-6 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-white mr-3" />
            <h3 className="text-xl font-bold text-white">IPO 股票追踪</h3>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-white bg-opacity-20 text-blue-800 text-sm font-semibold rounded-full">
              {filteredStocks.length} 支股票
            </span>
            <div className="h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{filteredStocks.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <div className="flex items-center">
                  📈 股票代码
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <div className="flex items-center">
                  🏢 公司名称
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <div className="flex items-center">
                  ⚡ 状态
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <div className="flex items-center">
                  🌍 市场
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <div className="flex items-center">
                  📅 上市日期
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <div className="flex items-center">
                  💰 预期价格
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                <div className="flex items-center">
                  📊 市值
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStocks.length > 0 ? filteredStocks.map((stock) => (
              <tr 
                key={stock.id} 
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-l-4 border-transparent hover:border-blue-400"
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">{stock.symbol.substring(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{stock.symbol}</p>
                      <p className="text-xs text-gray-500">股票代码</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm font-semibold text-gray-900 max-w-xs">
                    {stock.companyName}
                  </div>
                  {stock.sector && (
                    <div className="text-xs text-gray-500 mt-1">
                      {stock.sector}
                    </div>
                  )}
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusColor(stock.status)}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${getStatusBadgeColor(stock.status)}`}></div>
                    {getStatusText(stock.status)}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{stock.market === 'US' ? '🇺🇸' : '🇭🇰'}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{stock.market === 'US' ? '美国' : '香港'}</p>
                      <p className="text-xs text-gray-500">{stock.market === 'US' ? 'NASDAQ/NYSE' : 'HKEX'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {stock.ipoDate ? new Date(stock.ipoDate).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'short', 
                        day: 'numeric'
                      }) : '待定'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stock.ipoDate ? 
                        `${Math.ceil((new Date(stock.ipoDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 天后` 
                        : '日期未确定'
                      }
                    </p>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-bold text-green-600">
                      {formatPrice(stock.expectedPrice)}
                    </p>
                    {stock.priceRange && (
                      <p className="text-xs text-gray-500">
                        {stock.priceRange}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatMarketCap(stock.marketCap)}
                    </p>
                    {stock.sharesOffered && (
                      <p className="text-xs text-gray-500">
                        {stock.sharesOffered.toLocaleString()} 股
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/performance/${stock.id}`}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                      title="查看详情"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(stock.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">暂无 IPO 股票</h4>
                    <p className="text-gray-500">还没有添加任何 IPO 股票信息</p>
                    <div className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg">
                      💡 提示：点击上方"Add New IPO Stock"按钮添加股票
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}