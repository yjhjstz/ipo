'use client'

import { useState, useRef } from 'react'
import { FileText, Loader2, AlertCircle, TrendingUp, TrendingDown, BarChart3, Upload, Link as LinkIcon } from 'lucide-react'
import { ProspectusAnalysis } from '@/lib/perplexity-ai'
import ProspectusCharts from './ProspectusCharts'

interface ProspectusAnalyzerProps {
  className?: string
}

export default function ProspectusAnalyzer({ className = '' }: ProspectusAnalyzerProps) {
  const [pdfUrl, setPdfUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [analysis, setAnalysis] = useState<ProspectusAnalysis | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'analysis' | 'charts'>('analysis')
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')
  const [uploadedFile, setUploadedFile] = useState<{ id: string; originalName: string; internalUrl: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/prospectus', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '文件上传失败')
      }

      setUploadedFile({
        id: data.data.id,
        originalName: data.data.originalName,
        internalUrl: data.data.internalUrl
      })
      
      // 自动设置外部可访问的URL用于分析 - 使用外部IP地址
      const externalHost = process.env.NEXT_PUBLIC_EXTERNAL_HOST || 'http://10.128.0.5:3000'
      const externalUrl = `${externalHost}${data.data.internalUrl}`
      setPdfUrl(externalUrl)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : '文件上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAnalyze = async () => {
    const externalHost = process.env.NEXT_PUBLIC_EXTERNAL_HOST || 'http://10.128.0.5:3000'
    const urlToAnalyze = uploadMode === 'file' && uploadedFile 
      ? `${externalHost}${uploadedFile.internalUrl}`
      : pdfUrl.trim()

    if (!urlToAnalyze) {
      setError(uploadMode === 'file' ? '请先上传PDF文件' : '请输入PDF URL')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setAnalysis(null)

    try {
      const response = await fetch('/api/analysis/prospectus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfUrl: urlToAnalyze }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '分析失败')
      }

      setAnalysis(data.data)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : '分析失败，请稍后重试')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Strong Buy':
        return 'text-green-600 bg-green-50'
      case 'Buy':
        return 'text-green-500 bg-green-50'
      case 'Hold':
        return 'text-yellow-600 bg-yellow-50'
      case 'Sell':
        return 'text-red-500 bg-red-50'
      case 'Strong Sell':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getRatingIcon = (rating: string) => {
    if (rating.includes('Buy')) {
      return <TrendingUp className="h-4 w-4" />
    } else if (rating.includes('Sell')) {
      return <TrendingDown className="h-4 w-4" />
    }
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 输入区域 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">招股书分析</h2>
        </div>
        
        <div className="space-y-4">
          {/* 输入方式选择 */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => {
                setUploadMode('url')
                setUploadedFile(null)
                setPdfUrl('')
                setError('')
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadMode === 'url'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <LinkIcon className="h-4 w-4" />
              <span>PDF链接</span>
            </button>
            <button
              onClick={() => {
                setUploadMode('file')
                setPdfUrl('')
                setError('')
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                uploadMode === 'file'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>上传文件</span>
            </button>
          </div>

          {uploadMode === 'url' ? (
            <div>
              <label htmlFor="pdfUrl" className="block text-sm font-medium text-gray-700 mb-2">
                招股书PDF链接
              </label>
              <input
                id="pdfUrl"
                type="url"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://example.com/prospectus.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isAnalyzing}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上传招股书PDF文件
              </label>
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isAnalyzing || isUploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing || isUploading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{isUploading ? '上传中...' : '选择PDF文件'}</span>
                </button>
                {uploadedFile && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{uploadedFile.originalName}</span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                支持PDF格式，最大文件大小50MB
              </p>
            </div>
          )}
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <button
            onClick={handleAnalyze}
            disabled={
              isAnalyzing || 
              isUploading || 
              (uploadMode === 'url' && !pdfUrl.trim()) ||
              (uploadMode === 'file' && !uploadedFile)
            }
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>分析中...</span>
              </>
            ) : (
              <span>开始分析</span>
            )}
          </button>
        </div>
      </div>

      {/* 分析结果 */}
      {analysis && (
        <div className="space-y-6">
          {/* 标签页导航 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>详细分析</span>
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'charts'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>图表分析</span>
              </button>
            </div>

            {/* 公司信息和投资建议 - 始终显示 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{analysis.companyName}</h3>
              
              <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${getRatingColor(analysis.analysis.investmentRecommendation.rating)}`}>
                {getRatingIcon(analysis.analysis.investmentRecommendation.rating)}
                <span className="font-semibold">{analysis.analysis.investmentRecommendation.rating}</span>
              </div>
              
              {analysis.analysis.investmentRecommendation.targetPrice && (
                <div className="mt-2 text-sm text-gray-600">
                  目标价格: {analysis.analysis.investmentRecommendation.targetPrice}
                </div>
              )}
            </div>
          </div>

          {/* 标签页内容 */}
          {activeTab === 'analysis' ? (
            <div className="space-y-6">{/* 原有的分析内容 */}

          {/* 商业模式 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">商业模式</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.analysis.businessModel}</p>
          </div>

          {/* 财务亮点 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">财务亮点</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">营收情况</div>
                <div className="text-gray-900">{analysis.analysis.financialHighlights.revenue || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">盈利能力</div>
                <div className="text-gray-900">{analysis.analysis.financialHighlights.profitability || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">增长趋势</div>
                <div className="text-gray-900">{analysis.analysis.financialHighlights.growth || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">负债水平</div>
                <div className="text-gray-900">{analysis.analysis.financialHighlights.debtLevels || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* 关键指标 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">关键指标</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">估值水平</div>
                <div className="text-gray-900">{analysis.analysis.keyMetrics.valuation || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">市销率</div>
                <div className="text-gray-900">{analysis.analysis.keyMetrics.priceToSales || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">市场规模</div>
                <div className="text-gray-900">{analysis.analysis.keyMetrics.marketSize || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">员工人数</div>
                <div className="text-gray-900">{analysis.analysis.keyMetrics.employeeCount || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* 竞争优势与风险 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">竞争优势</h4>
              <ul className="space-y-2">
                {analysis.analysis.competitiveAdvantages.map((advantage, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{advantage}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">主要风险</h4>
              <ul className="space-y-2">
                {analysis.analysis.riskFactors.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 市场机会 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">市场机会</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.analysis.marketOpportunity}</p>
          </div>

          {/* 管理团队 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">管理团队评估</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.analysis.managementTeam}</p>
          </div>

          {/* 投资建议详情 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">投资建议</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.analysis.investmentRecommendation.reasoning}</p>
          </div>
            </div>
          ) : (
            <ProspectusCharts analysis={analysis} />
          )}
        </div>
      )}
    </div>
  )
}