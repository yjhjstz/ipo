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
  const [marketAnalysisLoading, setMarketAnalysisLoading] = useState(false)
  const [stockAnalysisLoading, setStockAnalysisLoading] = useState(false)
  const [selectedStock, setSelectedStock] = useState('')
  const [aiProvider, setAiProvider] = useState<'perplexity' | 'claude'>('claude')

  const fetchMarketAnalysis = async () => {
    setMarketAnalysisLoading(true)
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
      setMarketAnalysisLoading(false)
    }
  }

  const fetchStockAnalysis = async (symbol: string) => {
    setStockAnalysisLoading(true)
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
      setStockAnalysisLoading(false)
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

  const statusData = data.stats.reduce((acc: Array<{ status: string; count: number }>, curr: { status: string; market: string; _count: { id: number } }) => {
    const existing = acc.find(item => item.status === curr.status)
    if (existing) {
      existing.count += curr._count.id
    } else {
      acc.push({ status: curr.status, count: curr._count.id })
    }
    return acc
  }, [] as Array<{ status: string; count: number }>)

  const marketData = data.totalsByMarket.map(item => ({
    market: 'United States 🇺🇸',
    count: item._count.id,
    avgPrice: item._avg.expectedPrice || 0,
    totalShares: item._sum.sharesOffered || 0
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-4">
              <Sparkles className="h-6 w-6 text-slate-700" />
            </div>
            IPO Analytics Dashboard
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-lg text-slate-600 font-medium">
              Comprehensive analysis of IPO market trends and AI-powered insights
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 font-semibold">AI Provider:</span>
              <div className="flex bg-white shadow-inner rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setAiProvider('perplexity')}
                  className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors flex items-center ${
                    aiProvider === 'perplexity' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-slate-700 shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Perplexity
                </button>
                <button
                  onClick={() => setAiProvider('claude')}
                  className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors flex items-center ${
                    aiProvider === 'claude' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-slate-700 shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  GitHub AI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Market Analysis */}
          <div className={`rounded-xl shadow-lg text-slate-700 ${
            aiProvider === 'perplexity' 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {aiProvider === 'perplexity' ? <Zap className="h-8 w-8 mr-3" /> : <Brain className="h-8 w-8 mr-3" />}
                  <div>
                    <h3 className="text-xl font-bold">AI Market Analysis</h3>
                    <p className="text-sm text-slate-700 font-medium">
                      {aiProvider === 'perplexity' ? 'Perplexity AI 市场洞察' : 'GitHub AI (GPT-4) 市场洞察'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchMarketAnalysis}
                  disabled={marketAnalysisLoading}
                  className="bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 text-white border border-slate-400"
                >
                  {marketAnalysisLoading ? '分析中...' : '获取分析'}
                </button>
              </div>
              
              {marketAnalysis ? (
                <div className="space-y-4">
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center text-slate-700">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      市场展望: {marketAnalysis.outlook === 'Bullish' ? '🐂 乐观' : 
                                marketAnalysis.outlook === 'Bearish' ? '🐻 悲观' : '😐 中性'}
                    </h4>
                    <p className="text-sm text-slate-700 font-medium">{marketAnalysis.marketOverview}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-100 border border-slate-200 rounded p-3">
                      <h5 className="font-semibold mb-2 text-slate-700">📈 趋势</h5>
                      <ul className="space-y-1 text-slate-700">
                        {marketAnalysis.trends.slice(0, 2).map((trend, i) => (
                          <li key={i}>• {trend}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded p-3">
                      <h5 className="font-semibold mb-2 text-slate-700">🎯 机会</h5>
                      <ul className="space-y-1 text-slate-700">
                        {marketAnalysis.opportunities.slice(0, 2).map((opp, i) => (
                          <li key={i}>• {opp}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded p-3">
                      <h5 className="font-semibold mb-2 text-slate-700">⚠️ 风险</h5>
                      <ul className="space-y-1 text-slate-700">
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
                  <p className="text-slate-700 font-medium">点击获取AI市场分析</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock Analysis */}
          <div className={`rounded-xl shadow-lg text-slate-700 ${
            aiProvider === 'perplexity' 
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Search className="h-8 w-8 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold">AI Stock Analysis</h3>
                    <p className="text-sm text-slate-700 font-medium">
                      {aiProvider === 'perplexity' ? 'Perplexity AI 个股分析' : 'GitHub AI (GPT-4) 个股分析'}
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
                    className="flex-1 px-3 py-2 bg-slate-200 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-500 text-sm focus:outline-none focus:border-slate-400 focus:bg-slate-100"
                  />
                  <button
                    onClick={() => selectedStock && fetchStockAnalysis(selectedStock)}
                    disabled={stockAnalysisLoading || !selectedStock}
                    className="bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 text-white border border-slate-400"
                  >
                    {stockAnalysisLoading ? '分析中...' : '分析'}
                  </button>
                </div>
              </div>
              
              {stockAnalysis ? (
                <div className="space-y-4">
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-700">{stockAnalysis.symbol} - {stockAnalysis.companyName}</h4>
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
                    <p className="text-sm text-slate-700 font-medium">{stockAnalysis.analysis.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-100 border border-slate-200 rounded p-3">
                      <h5 className="font-bold mb-2 text-green-200">✅ 优势</h5>
                      <ul className="space-y-1 text-slate-700">
                        {stockAnalysis.analysis.pros.slice(0, 3).map((pro, i) => (
                          <li key={i}>• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded p-3">
                      <h5 className="font-bold mb-2 text-red-200">❌ 劣势</h5>
                      <ul className="space-y-1 text-slate-700">
                        {stockAnalysis.analysis.cons.slice(0, 3).map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {stockAnalysis.analysis.keyMetrics && (
                    <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                      <h5 className="font-semibold mb-2 text-slate-700">📊 关键指标</h5>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-slate-700 font-medium">市值:</span><br/>
                          <span className="font-semibold text-slate-700">{stockAnalysis.analysis.keyMetrics.marketCap || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">预期增长:</span><br/>
                          <span className="font-semibold text-slate-700">{stockAnalysis.analysis.keyMetrics.expectedGrowth || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">风险级别:</span><br/>
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
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-slate-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Building className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-100">Active IPOs</p>
                <p className="text-3xl font-bold text-slate-700">
                  {data.totalsByMarket.reduce((sum, item) => sum + item._count.id, 0)}
                </p>
                <p className="text-xs text-blue-100 mt-1">Excluding withdrawn</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-slate-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Target className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-100">Upcoming (30 days)</p>
                <p className="text-3xl font-bold text-slate-700">
                  {data.upcomingIpos.length}
                </p>
                <p className="text-xs text-green-100 mt-1">Ready to launch</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-slate-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-100">Avg. Price (US)</p>
                <p className="text-3xl font-bold text-slate-700">
                  ${data.totalsByMarket.find(m => m.market === 'US')?._avg.expectedPrice?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-yellow-100 mt-1">Expected pricing</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-slate-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Activity className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-100">Market Activity</p>
                <p className="text-3xl font-bold text-slate-700">
                  {statusData.find(s => s.status === 'PRICING')?.count || 0}
                </p>
                <p className="text-xs text-purple-100 mt-1">Currently pricing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">IPOs by Status</h3>
              <div className="text-sm text-slate-500 font-medium">Distribution</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
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

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Market Distribution</h3>
              <div className="text-sm text-slate-500 font-medium">By Region</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={marketData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis 
                  dataKey="market" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Price Analysis</h3>
              <div className="text-sm text-slate-500 font-medium">Average Expected Price</div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={marketData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis 
                  dataKey="market" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [`$${value?.toFixed(2)}`, 'Avg Price']}
                />
                <Bar dataKey="avgPrice" fill="url(#greenGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
          <div className="px-6 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-slate-700 mr-3" />
                <h3 className="text-xl font-bold text-slate-700">即将上市的 IPO (未来30天)</h3>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-white bg-opacity-20 text-slate-700 text-sm font-semibold rounded-full">
                  {data.upcomingIpos.length} 支股票
                </span>
                <div className="h-6 w-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-slate-700 text-xs font-bold">{data.upcomingIpos.length}</span>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.upcomingIpos.length > 0 ? data.upcomingIpos.map((ipo) => (
                  <tr key={ipo.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-l-4 border-transparent hover:border-blue-400">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-slate-700 font-bold text-sm">{ipo.symbol.substring(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{ipo.symbol}</p>
                          <p className="text-xs text-gray-500">股票代码</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-gray-900 max-w-xs">
                        {ipo.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                        ipo.status === 'UPCOMING' 
                          ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' 
                          : ipo.status === 'PRICING'
                          ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300'
                          : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          ipo.status === 'UPCOMING' ? 'bg-blue-500' : 
                          ipo.status === 'PRICING' ? 'bg-orange-500' : 'bg-green-500'
                        }`}></div>
                        {ipo.status === 'UPCOMING' ? '即将上市' : ipo.status === 'PRICING' ? '定价中' : ipo.status}
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
                          {ipo.ipoDate ? new Date(ipo.ipoDate).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric'
                          }) : '待定'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ipo.ipoDate ? 
                            `${Math.ceil((new Date(ipo.ipoDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 天后` 
                            : '日期未确定'
                          }
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-bold text-green-600">
                          {ipo.expectedPrice ? `$${ipo.expectedPrice}` : '未公布'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ipo.expectedPrice ? '预期价格' : '价格待定'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">暂无即将上市的 IPO</h4>
                        <p className="text-gray-500">未来30天内没有计划上市的新股</p>
                        <div className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg">
                          💡 提示：请稍后再查看或关注其他时间段的 IPO 信息
                        </div>
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