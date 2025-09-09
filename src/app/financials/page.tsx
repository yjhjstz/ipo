'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Download, FileText, TrendingUp, AlertTriangle, Upload } from 'lucide-react'
import FilingViewer from '@/components/FilingViewer'
import FileUploadAnalyzer from '@/components/FileUploadAnalyzer'
import { searchStocks } from '@/lib/stock-suggestions'

interface Filing {
  id: string
  ticker: string
  companyName: string
  formType: string
  filedAt: string
  linkToFilingDetails: string
  isAnalyzed?: boolean
}

interface FilingContent {
  filing: {
    id: string
    ticker: string
    companyName: string
    formType: string
    filedAt: string
  }
  content: {
    raw: string
    analyzed: string
    tables: number
    sections: string[]
  }
  metadata: {
    contentLength: number
    tablesFound: number
    sectionsFound: number
    analyzedLength: number
  }
}

interface Analysis {
  id: string
  summary: string
  keyFindings: string[]
  strengths: string[]
  weaknesses: string[]
  risks: string[]
  opportunities: string[]
  overallScore: number
  profitabilityScore: number
  liquidityScore: number
  solvencyScore: number
  recommendation: string
  confidenceScore: number
  targetPrice?: number
  priceRange?: string
  revenue?: number
  netIncome?: number
  totalAssets?: number
  totalDebt?: number
  cashAndEquivalents?: number
}

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'upload'>('search')
  const [searchTicker, setSearchTicker] = useState('')
  const [filings, setFilings] = useState<Filing[]>([])
  const [filingContent, setFilingContent] = useState<FilingContent | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')
  const [error, setError] = useState('')
  
  // 联想搜索相关状态
  const [suggestions, setSuggestions] = useState<Array<{symbol: string, name: string, sector: string}>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // 处理输入变化和联想搜索
  const handleInputChange = (value: string) => {
    setSearchTicker(value)
    
    if (value.trim().length > 0) {
      const searchResults = searchStocks(value, 8)
      setSuggestions(searchResults)
      setShowSuggestions(searchResults.length > 0)
      setSelectedSuggestionIndex(-1)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex])
        } else {
          searchFilings()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  // 选择联想建议
  const selectSuggestion = (suggestion: {symbol: string, name: string, sector: string}) => {
    setSearchTicker(suggestion.symbol)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    // 自动触发搜索
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.blur()
      }
      // 自动搜索
      triggerSearch(suggestion.symbol)
    }, 100)
  }

  // 触发搜索函数
  const triggerSearch = async (ticker?: string) => {
    const searchTerm = ticker || searchTicker
    if (!searchTerm.trim()) return

    setLoading(true)
    setError('')
    setFilings([])

    try {
      const response = await fetch(`/api/sec/search-filings?ticker=${searchTerm.toUpperCase()}&size=10`)
      const result = await response.json()

      if (result.success && result.data.filings) {
        setFilings(result.data.filings)
      } else {
        setError(result.message || 'Failed to search filings')
      }
    } catch (err) {
      setError('Failed to search SEC filings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchFilings = async () => {
    await triggerSearch()
  }

  const getFilingContent = async (filing: Filing) => {
    setLoading(true)
    setError('')
    setFilingContent(null)
    setAnalysis(null)
    setAnalysisStep('')

    try {
      // Step 1: Fetching content
      setAnalysisStep('正在获取SEC财报内容...')
      
      const response = await fetch('/api/sec/quick-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filing })
      })

      // Step 2: Processing response
      setAnalysisStep('正在处理财报数据...')
      const result = await response.json()

      if (result.success) {
        // Step 3: Content loaded
        setAnalysisStep('财报内容已加载，AI分析中...')
        setFilingContent(result.data)
        
        // Small delay to show the progress step
        setTimeout(() => {
          setAnalysisStep('AI分析完成！')
          if (result.data.analysis) {
            setAnalysis(result.data.analysis)
          }
          setTimeout(() => {
            setAnalysisStep('')
          }, 2000)
        }, 500)
      } else {
        setError(result.message || 'Failed to get filing content and analysis')
      }
    } catch (err) {
      setError('Failed to load and analyze filing')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A'
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}B`
    }
    return `$${num.toFixed(0)}M`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec.toLowerCase()) {
      case 'buy': return 'bg-green-100 text-green-800'
      case 'hold': return 'bg-yellow-100 text-yellow-800'
      case 'sell': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const downloadRawHTML = () => {
    if (!filingContent) return
    
    // 下载原始HTML内容
    const htmlContent = filingContent.content.raw
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filingContent.filing.ticker}_${filingContent.filing.formType}_原始财报_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEC财报分析</h1>
        <p className="text-gray-600">搜索美国上市公司的10-K年报和10-Q季报，或上传HTML格式财务报表进行AI深度分析</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              在线搜索
            </span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              文件上传
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'search' && (
        <>
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              股票代码 (如: AAPL, MSFT, GOOGL)
            </label>
            <input
              ref={inputRef}
              type="text"
              value={searchTicker}
              onChange={(e) => handleInputChange(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchTicker.trim() && suggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              placeholder="输入股票代码或公司名称"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="off"
            />
            
            {/* 联想建议下拉列表 */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.symbol}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      index === selectedSuggestionIndex
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {suggestion.symbol}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {suggestion.name}
                        </div>
                      </div>
                      <div className="ml-2">
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {suggestion.sector}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={searchFilings}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? '搜索中...' : '搜索财报'}
          </button>
        </div>

        {/* 热门股票快选 */}
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">热门股票快选：</div>
          <div className="flex flex-wrap gap-2">
            {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META', 'NVDA', 'SOFI'].map((symbol) => (
              <button
                key={symbol}
                onClick={() => {
                  setSearchTicker(symbol)
                  setShowSuggestions(false)
                  triggerSearch(symbol)
                }}
                disabled={loading}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Analysis Progress */}
      {(loading || analysisStep) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <div className="text-blue-800 font-medium">
                {analysisStep || '处理中...'}
              </div>
              {analysisStep.includes('AI分析中') && (
                <div className="text-blue-600 text-sm mt-1">
                  正在使用GitHub AI进行深度财务分析，请稍候...
                </div>
              )}
              {analysisStep.includes('AI分析完成') && (
                <div className="text-green-600 text-sm mt-1">
                  ✨ 分析结果已生成，请查看下方内容
                </div>
              )}
            </div>
          </div>
          
          {/* Progress steps indicator */}
          <div className="mt-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className={`flex items-center space-x-2 ${analysisStep.includes('获取') ? 'text-blue-600' : analysisStep.includes('处理') || analysisStep.includes('AI分析') || analysisStep.includes('完成') ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${analysisStep.includes('获取') ? 'bg-blue-600 animate-pulse' : analysisStep.includes('处理') || analysisStep.includes('AI分析') || analysisStep.includes('完成') ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <span>获取财报</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${analysisStep.includes('处理') ? 'text-blue-600' : analysisStep.includes('AI分析') || analysisStep.includes('完成') ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${analysisStep.includes('处理') ? 'bg-blue-600 animate-pulse' : analysisStep.includes('AI分析') || analysisStep.includes('完成') ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <span>数据处理</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${analysisStep.includes('AI分析中') ? 'text-blue-600' : analysisStep.includes('完成') ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${analysisStep.includes('AI分析中') ? 'bg-blue-600 animate-pulse' : analysisStep.includes('完成') ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <span>AI分析</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${analysisStep.includes('完成') ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${analysisStep.includes('完成') ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <span>分析完成</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filings List */}
      {filings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              找到 {filings.length} 个财报文件
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filings.map((filing) => (
              <div key={filing.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {filing.companyName} ({filing.ticker})
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                        {filing.formType}
                      </span>
                      发布时间: {new Date(filing.filedAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={filing.linkToFilingDetails}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      原文
                    </a>
                    <button
                      onClick={() => getFilingContent(filing)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <TrendingUp className="w-3 h-3" />
                      {loading ? '分析中...' : '获取并分析'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filing Content & Analysis */}
      {filingContent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Overview */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                财报内容
              </h3>
              <div className="text-sm text-gray-500 mt-1">
                {filingContent.filing.companyName} - {filingContent.filing.formType}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(filingContent.metadata.contentLength / 1000)}K
                  </div>
                  <div className="text-sm text-gray-600">内容长度</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {filingContent.metadata.tablesFound}
                  </div>
                  <div className="text-sm text-gray-600">财务表格</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">识别的关键部分:</h4>
                <div className="flex flex-wrap gap-2">
                  {filingContent.content.sections.map((section, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 font-medium">
                  ✅ AI分析已完成
                </div>
                <div className="text-xs text-green-500 mt-1">
                  查看右侧分析结果
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Results */}
          {analysis && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  AI财务分析
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRecommendationColor(analysis.recommendation)}`}>
                      {analysis.recommendation}
                    </span>
                    <span className="text-sm text-gray-500">
                      置信度: {analysis.confidenceScore}%
                    </span>
                  </div>
                  <button
                    onClick={downloadRawHTML}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    下载原文
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">财务状况总结</h4>
                  <p className="text-gray-700 text-sm">{analysis.summary}</p>
                </div>

                {/* Scores */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">财务评分</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`text-xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </div>
                      <div className="text-xs text-gray-600">综合评分</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`text-xl font-bold ${getScoreColor(analysis.profitabilityScore)}`}>
                        {analysis.profitabilityScore}
                      </div>
                      <div className="text-xs text-gray-600">盈利能力</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`text-xl font-bold ${getScoreColor(analysis.liquidityScore)}`}>
                        {analysis.liquidityScore}
                      </div>
                      <div className="text-xs text-gray-600">流动性</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className={`text-xl font-bold ${getScoreColor(analysis.solvencyScore)}`}>
                        {analysis.solvencyScore}
                      </div>
                      <div className="text-xs text-gray-600">偿债能力</div>
                    </div>
                  </div>
                </div>

                {/* Financial Metrics */}
                {(analysis.revenue || analysis.netIncome) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">关键财务指标</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">营收:</span>
                        <span className="font-medium">{formatNumber(analysis.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">净利润:</span>
                        <span className="font-medium">{formatNumber(analysis.netIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总资产:</span>
                        <span className="font-medium">{formatNumber(analysis.totalAssets)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总债务:</span>
                        <span className="font-medium">{formatNumber(analysis.totalDebt)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Findings */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    关键发现
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {analysis.keyFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    风险因素
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {analysis.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Price */}
                {analysis.targetPrice && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">AI目标价格</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${analysis.targetPrice}
                      </div>
                      {analysis.priceRange && (
                        <div className="text-sm text-gray-600 mt-1">
                          区间: {analysis.priceRange}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}

      {activeTab === 'upload' && (
        <FileUploadAnalyzer />
      )}

      {/* Filing Viewer */}
      {filingContent && activeTab === 'search' && (
        <div className="mt-6">
          <FilingViewer
            content={filingContent.content}
            filing={filingContent.filing}
            metadata={filingContent.metadata}
          />
        </div>
      )}
    </div>
  )
}