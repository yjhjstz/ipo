'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, TrendingUp, AlertTriangle, BarChart3, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface FileInfo {
  id: string
  originalName: string
  fileName: string
  size: number
  type: string
  uploadedAt: string
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

interface ChartData {
  revenue: number[]
  netIncome: number[]
  assets: number[]
  quarters: string[]
}

interface AnalysisResult {
  success: boolean
  data: {
    fileInfo: FileInfo
    content: {
      raw: string
      analyzed: string
    }
    analysis: Analysis
    chartData: ChartData
    metadata: {
      processingTime: number
      detectedTicker: string
      detectedCompany: string
      detectedFormType: string
    }
  }
}

export default function FileUploadAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadStep, setUploadStep] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // 验证文件类型 - 只支持HTML
    const allowedTypes = ['text/html', 'application/html']
    const allowedExtensions = ['.html', '.htm']
    
    const isValidType = allowedTypes.includes(file.type) || 
                       allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isValidType) {
      setError('只支持HTML格式的财务报表文件')
      return
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过10MB')
      return
    }

    setSelectedFile(file)
    setError('')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const uploadAndAnalyze = async () => {
    if (!selectedFile) return

    setUploading(true)
    setAnalyzing(true)
    setError('')
    setResult(null)

    try {
      // Step 1: Upload file
      setUploadStep('正在上传文件...')
      
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || '文件上传失败')
      }

      setUploading(false)

      // Step 2: Analyze file
      setUploadStep('正在解析文件内容...')
      
      const analyzeResponse = await fetch('/api/analyze-uploaded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileInfo: uploadResult.data })
      })

      setUploadStep('AI分析中，请稍候...')
      
      const analyzeResult = await analyzeResponse.json()

      if (!analyzeResult.success) {
        throw new Error(analyzeResult.error || 'AI分析失败')
      }

      setUploadStep('分析完成！')
      setResult(analyzeResult)
      
      setTimeout(() => setUploadStep(''), 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败')
      console.error(err)
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setResult(null)
    setError('')
    setUploadStep('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  // 准备图表数据
  const chartData = result?.data.chartData ? 
    result.data.chartData.quarters.map((quarter, idx) => ({
      quarter,
      revenue: result.data.chartData.revenue[idx] || 0,
      netIncome: result.data.chartData.netIncome[idx] || 0,
      assets: result.data.chartData.assets[idx] || 0
    })) : []

  const scoreData = result?.data.analysis ? [
    { name: '综合', value: result.data.analysis.overallScore, color: '#3B82F6' },
    { name: '盈利', value: result.data.analysis.profitabilityScore, color: '#10B981' },
    { name: '流动性', value: result.data.analysis.liquidityScore, color: '#F59E0B' },
    { name: '偿债', value: result.data.analysis.solvencyScore, color: '#EF4444' }
  ] : []

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          上传财报文件分析
        </h2>
        <p className="text-gray-600">支持HTML格式的财务报表文件，AI将自动分析并生成图表。</p>
      </div>

      {!result && (
        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : selectedFile 
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center space-x-4">
                <FileText className="w-12 h-12 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{selectedFile.name}</div>
                  <div className="text-sm text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  disabled={uploading || analyzing}
                  className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">
                  拖放HTML文件到此处或点击选择
                </div>
                <div className="text-gray-500 mb-4">
                  支持HTML格式的财务报表文件，最大10MB
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || analyzing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  选择文件
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Upload and Analyze Button */}
          {selectedFile && !error && (
            <div className="flex justify-center">
              <button
                onClick={uploadAndAnalyze}
                disabled={uploading || analyzing}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                {uploading || analyzing ? '处理中...' : '上传并分析'}
              </button>
            </div>
          )}

          {/* Progress Indicator */}
          {(uploading || analyzing || uploadStep) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <div className="text-blue-800 font-medium">
                    {uploadStep || '处理中...'}
                  </div>
                  {uploadStep.includes('AI分析中') && (
                    <div className="text-blue-600 text-sm mt-1">
                      正在使用GitHub AI进行深度财务分析，请稍候...
                    </div>
                  )}
                  {uploadStep.includes('分析完成') && (
                    <div className="text-green-600 text-sm mt-1">
                      ✨ 分析结果已生成，请查看下方内容
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className={`flex items-center space-x-2 ${uploadStep.includes('上传') ? 'text-blue-600' : uploading ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${uploadStep.includes('上传') ? 'bg-blue-600 animate-pulse' : uploading ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <span>文件上传</span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 ${uploadStep.includes('解析') ? 'text-blue-600' : uploadStep.includes('AI分析') || uploadStep.includes('完成') ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${uploadStep.includes('解析') ? 'bg-blue-600 animate-pulse' : uploadStep.includes('AI分析') || uploadStep.includes('完成') ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <span>内容解析</span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 ${uploadStep.includes('AI分析中') ? 'text-blue-600' : uploadStep.includes('完成') ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${uploadStep.includes('AI分析中') ? 'bg-blue-600 animate-pulse' : uploadStep.includes('完成') ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <span>AI分析</span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 ${uploadStep.includes('完成') ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${uploadStep.includes('完成') ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    <span>分析完成</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{result.data.fileInfo.originalName}</div>
                <div className="text-sm text-gray-500">
                  检测到: {result.data.metadata.detectedCompany} ({result.data.metadata.detectedTicker}) - {result.data.metadata.detectedFormType}
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                上传新文件
              </button>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Analysis */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                AI财务分析
              </h3>
              
              <div className="space-y-4">
                {/* Recommendation */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(result.data.analysis.recommendation)}`}>
                    {result.data.analysis.recommendation}
                  </span>
                  <span className="text-sm text-gray-500">
                    置信度: {result.data.analysis.confidenceScore}%
                  </span>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">财务状况总结</h4>
                  <p className="text-gray-700 text-sm">{result.data.analysis.summary}</p>
                </div>

                {/* Financial Metrics */}
                {(result.data.analysis.revenue || result.data.analysis.netIncome) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">关键财务指标</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">营收:</span>
                        <span className="font-medium">{formatNumber(result.data.analysis.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">净利润:</span>
                        <span className="font-medium">{formatNumber(result.data.analysis.netIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总资产:</span>
                        <span className="font-medium">{formatNumber(result.data.analysis.totalAssets)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">总债务:</span>
                        <span className="font-medium">{formatNumber(result.data.analysis.totalDebt)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Price */}
                {result.data.analysis.targetPrice && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">AI目标价格</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${result.data.analysis.targetPrice}
                      </div>
                      {result.data.analysis.priceRange && (
                        <div className="text-sm text-gray-600 mt-1">
                          区间: {result.data.analysis.priceRange}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Scores */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                财务评分
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className={`text-2xl font-bold ${getScoreColor(result.data.analysis.overallScore)}`}>
                    {result.data.analysis.overallScore}
                  </div>
                  <div className="text-sm text-gray-600">综合评分</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className={`text-2xl font-bold ${getScoreColor(result.data.analysis.profitabilityScore)}`}>
                    {result.data.analysis.profitabilityScore}
                  </div>
                  <div className="text-sm text-gray-600">盈利能力</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className={`text-2xl font-bold ${getScoreColor(result.data.analysis.liquidityScore)}`}>
                    {result.data.analysis.liquidityScore}
                  </div>
                  <div className="text-sm text-gray-600">流动性</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className={`text-2xl font-bold ${getScoreColor(result.data.analysis.solvencyScore)}`}>
                    {result.data.analysis.solvencyScore}
                  </div>
                  <div className="text-sm text-gray-600">偿债能力</div>
                </div>
              </div>

              {/* Score Chart */}
              {scoreData.length > 0 && (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {scoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Charts */}
          {chartData.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                财务趋势图表
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">营收趋势</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Profit Chart */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">净利润趋势</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="netIncome" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Findings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                关键发现
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                {result.data.analysis.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                风险因素
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                {result.data.analysis.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}