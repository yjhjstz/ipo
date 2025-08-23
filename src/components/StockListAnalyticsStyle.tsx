'use client'

import { useState } from 'react'
import { IpoStock } from '@/types/ipo'
import { Calendar, TrendingUp, Building2, DollarSign, Globe, MoreHorizontal, Edit, Trash2, BarChart3 } from 'lucide-react'

interface StockListAnalyticsStyleProps {
  stocks: IpoStock[]
  onStockDeleted: (id: string) => void
}

export default function StockListAnalyticsStyle({ stocks, onStockDeleted }: StockListAnalyticsStyleProps) {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [showMetrics, setShowMetrics] = useState(false)
  const [metricsData, setMetricsData] = useState<any>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  
  // Show all stocks including PRICING status
  const filteredStocks = stocks

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

  const handleViewMetrics = async (symbol: string) => {
    setLoadingMetrics(true)
    setShowMetrics(true)
    
    try {
      const response = await fetch(`/api/stock/metric?symbol=${symbol}&metric=all`)
      if (response.ok) {
        const data = await response.json()
        setMetricsData(data)
      } else {
        alert('Failed to fetch financial metrics')
      }
    } catch (error) {
      console.error('Error fetching financial metrics:', error)
      alert('Error fetching financial metrics')
    } finally {
      setLoadingMetrics(false)
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
                    <span className="text-2xl mr-2">🇺🇸</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">美国</p>
                      <p className="text-xs text-gray-500">NASDAQ/NYSE</p>
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
                    <button
                      onClick={() => handleViewMetrics(stock.symbol)}
                      className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                      title="基本财务指标"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
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

      {/* 基本财务指标弹窗 */}
      {showMetrics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2" />
                  {metricsData?.symbol} 基本财务指标
                </h3>
                <button
                  onClick={() => setShowMetrics(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {loadingMetrics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">正在获取财务指标数据...</p>
                </div>
              ) : metricsData?.metrics?.metric ? (
                <div className="space-y-6">
                  {/* 估值指标 */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      估值指标
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {metricsData.metrics.metric.peBasicExclExtraTTM && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">市盈率 (TTM)</p>
                          <p className="text-xl font-bold text-blue-600">{metricsData.metrics.metric.peBasicExclExtraTTM.toFixed(2)}</p>
                        </div>
                      )}
                      {metricsData.metrics.metric.pbAnnual && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">市净率</p>
                          <p className="text-xl font-bold text-blue-600">{metricsData.metrics.metric.pbAnnual.toFixed(2)}</p>
                        </div>
                      )}
                      {metricsData.metrics.metric.psAnnual && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">市销率</p>
                          <p className="text-xl font-bold text-blue-600">{metricsData.metrics.metric.psAnnual.toFixed(2)}</p>
                        </div>
                      )}
                      {metricsData.metrics.metric.pcfShareTTM && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">市现率 (TTM)</p>
                          <p className="text-xl font-bold text-blue-600">{metricsData.metrics.metric.pcfShareTTM.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 盈利能力 */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      盈利能力
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {metricsData.metrics.metric.grossMarginTTM && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">毛利率 (TTM)</p>
                          <p className="text-xl font-bold text-green-600">{(metricsData.metrics.metric.grossMarginTTM * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      {metricsData.metrics.metric.operatingMarginTTM && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">营业利润率 (TTM)</p>
                          <p className="text-xl font-bold text-green-600">{(metricsData.metrics.metric.operatingMarginTTM * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      {metricsData.metrics.metric.netProfitMarginTTM && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">净利润率 (TTM)</p>
                          <p className="text-xl font-bold text-green-600">{(metricsData.metrics.metric.netProfitMarginTTM * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      {metricsData.metrics.metric.roeTTM && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">净资产收益率 (TTM)</p>
                          <p className="text-xl font-bold text-green-600">{(metricsData.metrics.metric.roeTTM * 100).toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 股价表现 */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-purple-800 mb-3 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      股价表现
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {metricsData.metrics.metric["52WeekHigh"] && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">52周最高</p>
                          <p className="text-xl font-bold text-red-600">${metricsData.metrics.metric["52WeekHigh"].toFixed(2)}</p>
                        </div>
                      )}
                      {metricsData.metrics.metric["52WeekLow"] && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">52周最低</p>
                          <p className="text-xl font-bold text-green-600">${metricsData.metrics.metric["52WeekLow"].toFixed(2)}</p>
                        </div>
                      )}
                      {metricsData.metrics.metric["52WeekPriceReturnDaily"] && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">52周涨跌幅</p>
                          <p className={`text-xl font-bold ${metricsData.metrics.metric["52WeekPriceReturnDaily"] >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(metricsData.metrics.metric["52WeekPriceReturnDaily"] * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {metricsData.metrics.metric.beta && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">Beta系数</p>
                          <p className="text-xl font-bold text-purple-600">{metricsData.metrics.metric.beta.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 财务健康度 */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-orange-800 mb-3 flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      财务健康度
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {metricsData.metrics.metric.currentRatioAnnual && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">流动比率</p>
                          <p className="text-xl font-bold text-orange-600">{metricsData.metrics.metric.currentRatioAnnual.toFixed(2)}</p>
                        </div>
                      )}
                      {metricsData.metrics.metric.longTermDebtTotalCapitalAnnual && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">长期负债率</p>
                          <p className="text-xl font-bold text-orange-600">{(metricsData.metrics.metric.longTermDebtTotalCapitalAnnual * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      {metricsData.metrics.metric.totalDebtToEquityAnnual && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">资产负债率</p>
                          <p className="text-xl font-bold text-orange-600">{(metricsData.metrics.metric.totalDebtToEquityAnnual * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      {metricsData.metrics.metric.roaTTM && (
                        <div className="bg-white rounded p-3 text-center">
                          <p className="text-sm text-gray-600">总资产收益率 (TTM)</p>
                          <p className="text-xl font-bold text-orange-600">{(metricsData.metrics.metric.roaTTM * 100).toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">暂无财务指标数据</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}