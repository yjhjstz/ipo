'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import { TrendingUp, DollarSign, Building, Calendar, Activity, Target, Brain, Search, Sparkles, Zap } from 'lucide-react'

interface MarketAnalysis {
  marketOverview: string
  trends: string[]
  opportunities: string[]
  risks: string[]
  outlook: 'Bullish' | 'Bearish' | 'Neutral'
}

interface StockAnalysis {
  symbol: string
  companyName: string
  analysis: {
    summary: string
    pros: string[]
    cons: string[]
    riskLevel: 'Low' | 'Medium' | 'High'
    recommendation: 'Buy' | 'Hold' | 'Sell' | 'Watch'
    priceTarget?: number
    keyMetrics?: {
      marketCap?: string
      expectedGrowth?: string
      valuation?: string
    }
  }
}

interface AnalyticsData {
  stats: Array<{
    status: string
    market: string
    _count: { id: number }
  }>
  totalsByMarket: Array<{
    market: string
    _count: { id: number }
    _avg: { expectedPrice: number | null }
    _sum: { sharesOffered: number | null }
  }>
  upcomingIpos: Array<{
    id: string
    symbol: string
    companyName: string
    market: string
    ipoDate: string
    expectedPrice?: number
    status: string
  }>
  monthlyTrend: Array<{
    createdAt: string
    _count: { id: number }
  }>
}

const STATUS_COLORS = {
  'UPCOMING': '#3B82F6',
  'PRICING': '#F59E0B', 
  'LISTED': '#10B981',
  'POSTPONED': '#EF4444'
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316']

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null)
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [selectedStock, setSelectedStock] = useState('')
  const [aiProvider, setAiProvider] = useState<'perplexity' | 'claude'>('perplexity')

  const fetchMarketAnalysis = async () => {
    setAnalysisLoading(true)
    try {
      const response = await fetch('/api/analysis/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          market: null,
          provider: aiProvider
        })
      })
      const result = await response.json()
      if (result.success) {
        setMarketAnalysis(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch market analysis:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const fetchStockAnalysis = async (symbol: string) => {
    setAnalysisLoading(true)
    try {
      const response = await fetch('/api/analysis/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symbol,
          provider: aiProvider
        })
      })
      const result = await response.json()
      if (result.success) {
        setStockAnalysis(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch stock analysis:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics')
        const analytics = await response.json()
        setData(analytics)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  const statusData = data.stats.reduce((acc: Array<{ status: string; count: number }>, curr) => {
    const existing = acc.find(item => item.status === curr.status)
    if (existing) {
      existing.count += curr._count.id
    } else {
      acc.push({ status: curr.status, count: curr._count.id })
    }
    return acc
  }, [])

  const marketData = data.totalsByMarket.map(item => ({
    market: item.market === 'US' ? 'United States 🇺🇸' : 'Hong Kong 🇭🇰',
    count: item._count.id,
    avgPrice: item._avg.expectedPrice || 0,
    totalShares: item._sum.sharesOffered || 0
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
            <Sparkles className="h-10 w-10 text-blue-600 mr-4" />
            IPO Analytics Dashboard
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-lg text-gray-600">
              Comprehensive analysis of IPO market trends and AI-powered insights
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">AI Provider:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setAiProvider('perplexity')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center ${
                    aiProvider === 'perplexity' 
                      ? 'bg-purple-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Perplexity
                </button>
                <button
                  onClick={() => setAiProvider('claude')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center ${
                    aiProvider === 'claude' 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  Claude
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Market Analysis */}
          <div className={`rounded-xl shadow-lg text-white ${
            aiProvider === 'perplexity' 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {aiProvider === 'perplexity' ? <Zap className="h-8 w-8 mr-3" /> : <Brain className="h-8 w-8 mr-3" />}
                  <div>
                    <h3 className="text-xl font-bold">AI Market Analysis</h3>
                    <p className={`text-sm ${aiProvider === 'perplexity' ? 'text-purple-100' : 'text-blue-100'}`}>
                      {aiProvider === 'perplexity' ? 'Perplexity AI 市场洞察' : 'Claude AI 市场洞察'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchMarketAnalysis}
                  disabled={analysisLoading}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {analysisLoading ? '分析中...' : '获取分析'}
                </button>
              </div>
              
              {marketAnalysis ? (
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      市场展望: {marketAnalysis.outlook === 'Bullish' ? '🐂 乐观' : 
                                marketAnalysis.outlook === 'Bearish' ? '🐻 悲观' : '😐 中性'}
                    </h4>
                    <p className="text-sm text-purple-100">{marketAnalysis.marketOverview}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white bg-opacity-10 rounded p-3">
                      <h5 className="font-semibold mb-2">📈 趋势</h5>
                      <ul className="space-y-1">
                        {marketAnalysis.trends.slice(0, 2).map((trend, i) => (
                          <li key={i}>• {trend}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded p-3">
                      <h5 className="font-semibold mb-2">🎯 机会</h5>
                      <ul className="space-y-1">
                        {marketAnalysis.opportunities.slice(0, 2).map((opp, i) => (
                          <li key={i}>• {opp}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded p-3">
                      <h5 className="font-semibold mb-2">⚠️ 风险</h5>
                      <ul className="space-y-1">
                        {marketAnalysis.risks.slice(0, 2).map((risk, i) => (
                          <li key={i}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-purple-100">点击获取AI市场分析</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock Analysis */}
          <div className={`rounded-xl shadow-lg text-white ${
            aiProvider === 'perplexity' 
              ? 'bg-gradient-to-br from-orange-500 to-red-500' 
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Search className="h-8 w-8 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold">AI Stock Analysis</h3>
                    <p className={`text-sm ${aiProvider === 'perplexity' ? 'text-orange-100' : 'text-blue-100'}`}>
                      {aiProvider === 'perplexity' ? 'Perplexity AI 个股分析' : 'Claude AI 个股分析'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入股票代码 (如: CURX)"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-blue-200 text-sm focus:outline-none focus:border-opacity-50"
                  />
                  <button
                    onClick={() => selectedStock && fetchStockAnalysis(selectedStock)}
                    disabled={analysisLoading || !selectedStock}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {analysisLoading ? '分析中...' : '分析'}
                  </button>
                </div>
              </div>
              
              {stockAnalysis ? (
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{stockAnalysis.symbol} - {stockAnalysis.companyName}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        stockAnalysis.analysis.recommendation === 'Buy' ? 'bg-green-500' :
                        stockAnalysis.analysis.recommendation === 'Hold' ? 'bg-yellow-500' :
                        stockAnalysis.analysis.recommendation === 'Sell' ? 'bg-red-500' : 'bg-gray-500'
                      }`}>
                        {stockAnalysis.analysis.recommendation === 'Buy' ? '买入' :
                         stockAnalysis.analysis.recommendation === 'Hold' ? '持有' :
                         stockAnalysis.analysis.recommendation === 'Sell' ? '卖出' : '观望'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-100">{stockAnalysis.analysis.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white bg-opacity-10 rounded p-3">
                      <h5 className="font-semibold mb-2 text-green-300">✅ 优势</h5>
                      <ul className="space-y-1">
                        {stockAnalysis.analysis.pros.slice(0, 3).map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded p-3">
                      <h5 className="font-semibold mb-2 text-red-300">❌ 劣势</h5>
                      <ul className="space-y-1">
                        {stockAnalysis.analysis.cons.slice(0, 3).map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {stockAnalysis.analysis.keyMetrics && (
                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                      <h5 className="font-semibold mb-2">📊 关键指标</h5>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-blue-200">市值:</span><br/>
                          <span className="font-semibold">{stockAnalysis.analysis.keyMetrics.marketCap || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-blue-200">预期增长:</span><br/>
                          <span className="font-semibold">{stockAnalysis.analysis.keyMetrics.expectedGrowth || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-blue-200">风险级别:</span><br/>
                          <span className={`font-semibold ${
                            stockAnalysis.analysis.riskLevel === 'Low' ? 'text-green-300' :
                            stockAnalysis.analysis.riskLevel === 'Medium' ? 'text-yellow-300' : 'text-red-300'
                          }`}>{
                            stockAnalysis.analysis.riskLevel === 'Low' ? '低' :
                            stockAnalysis.analysis.riskLevel === 'Medium' ? '中' : '高'
                          }</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-blue-100">输入股票代码获取AI分析</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-10 w-10 text-white opacity-80" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-100">Active IPOs</p>
                <p className="text-3xl font-bold text-white">
                  {data.totalsByMarket.reduce((sum, item) => sum + item._count.id, 0)}
                </p>
                <p className="text-xs text-blue-100 mt-1">Excluding withdrawn</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-10 w-10 text-white opacity-80" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-100">Upcoming (30 days)</p>
                <p className="text-3xl font-bold text-white">
                  {data.upcomingIpos.length}
                </p>
                <p className="text-xs text-green-100 mt-1">Ready to launch</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-10 w-10 text-white opacity-80" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-100">Avg. Price (US)</p>
                <p className="text-3xl font-bold text-white">
                  ${data.totalsByMarket.find(m => m.market === 'US')?._avg.expectedPrice?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-yellow-100 mt-1">Expected pricing</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-10 w-10 text-white opacity-80" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-100">Market Activity</p>
                <p className="text-3xl font-bold text-white">
                  {statusData.find(s => s.status === 'PRICING')?.count || 0}
                </p>
                <p className="text-xs text-purple-100 mt-1">Currently pricing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">IPOs by Status</h3>
              <div className="text-sm text-gray-500">Distribution</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }: { status: string; count: number; percent: number }) => 
                    `${status}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Market Distribution</h3>
              <div className="text-sm text-gray-500">By Region</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={marketData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="market" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Price Analysis</h3>
              <div className="text-sm text-gray-500">Average Expected Price</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={marketData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="market" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`$${value?.toFixed(2)}`, 'Avg Price']}
                />
                <Bar dataKey="avgPrice" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming IPOs (Next 30 Days)</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {data.upcomingIpos.length} upcoming
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IPO Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.upcomingIpos.length > 0 ? data.upcomingIpos.map((ipo) => (
                  <tr key={ipo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {ipo.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {ipo.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ipo.status === 'UPCOMING' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {ipo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ipo.market === 'US' ? '🇺🇸 US' : '🇭🇰 HK'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ipo.ipoDate ? new Date(ipo.ipoDate).toLocaleDateString() : 'TBD'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {ipo.expectedPrice ? `$${ipo.expectedPrice}` : 'N/A'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                        <p>No upcoming IPOs in the next 30 days</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}