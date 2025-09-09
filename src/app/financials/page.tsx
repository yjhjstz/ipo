'use client'

import { useState } from 'react'
import { Search, Download, FileText, TrendingUp, AlertTriangle } from 'lucide-react'
import FilingViewer from '@/components/FilingViewer'

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
  const [searchTicker, setSearchTicker] = useState('')
  const [filings, setFilings] = useState<Filing[]>([])
  const [selectedFiling, setSelectedFiling] = useState<Filing | null>(null)
  const [filingContent, setFilingContent] = useState<FilingContent | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')
  const [error, setError] = useState('')

  const searchFilings = async () => {
    if (!searchTicker.trim()) return

    setLoading(true)
    setError('')
    setFilings([])

    try {
      const response = await fetch(`/api/sec/search-filings?ticker=${searchTicker.toUpperCase()}&size=10`)
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

  const getFilingContent = async (filing: Filing) => {
    setLoading(true)
    setError('')
    setFilingContent(null)
    setAnalysis(null)
    setSelectedFiling(filing)
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEC财报分析</h1>
        <p className="text-gray-600">搜索美国上市公司的10-K年报和10-Q季报，使用AI进行深度财务分析</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              股票代码 (如: AAPL, MSFT, GOOGL)
            </label>
            <input
              type="text"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && searchFilings()}
              placeholder="输入股票代码"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRecommendationColor(analysis.recommendation)}`}>
                    {analysis.recommendation}
                  </span>
                  <span className="text-sm text-gray-500">
                    置信度: {analysis.confidenceScore}%
                  </span>
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

      {/* Filing Viewer */}
      {filingContent && (
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