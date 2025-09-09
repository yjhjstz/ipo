'use client'

import { useState } from 'react'
import { Eye, EyeOff, Download, Maximize2, Minimize2 } from 'lucide-react'

interface FilingViewerProps {
  content: {
    raw: string
    analyzed: string
    tables: number
    sections: string[]
  }
  filing: {
    id: string
    ticker: string
    companyName: string
    formType: string
    filedAt: string
  }
  metadata: {
    contentLength: number
    tablesFound: number
    sectionsFound: number
    analyzedLength: number
  }
}

export default function FilingViewer({ content, filing, metadata }: FilingViewerProps) {
  const [viewMode, setViewMode] = useState<'raw' | 'analyzed' | 'tables'>('analyzed')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const cleanHtmlForDisplay = (html: string, maxLength: number = 5000) => {
    // Remove scripts and styles
    let cleaned = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    
    // For raw view, keep some HTML structure but limit length
    if (viewMode === 'raw') {
      cleaned = cleaned.substring(0, maxLength)
      if (html.length > maxLength) {
        cleaned += '\n\n... (内容已截断，完整内容请下载原文查看)'
      }
    } else {
      // For analyzed view, strip all HTML tags
      cleaned = cleaned
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, maxLength)
      
      if (cleaned.length >= maxLength) {
        cleaned += '\n\n... (显示前5000字符)'
      }
    }
    
    return cleaned
  }

  const extractFinancialTables = (html: string) => {
    const tables: string[] = []
    const tableMatches = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi)
    
    if (tableMatches) {
      tableMatches.slice(0, 5).forEach((table) => {
        // Check if table contains financial keywords
        const hasFinancialContent = /revenue|income|assets|liabilities|equity|cash|debt/i.test(table)
        if (hasFinancialContent) {
          // Clean up table HTML for display
          const cleanTable = table
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .substring(0, 2000)
          
          tables.push(cleanTable)
        }
      })
    }
    
    return tables
  }

  const financialTables = extractFinancialTables(content.raw)

  const downloadContent = () => {
    const blob = new Blob([content.raw], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filing.ticker}-${filing.formType}-${filing.filedAt.split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getDisplayContent = () => {
    switch (viewMode) {
      case 'raw':
        return cleanHtmlForDisplay(content.raw, 10000)
      case 'analyzed':
        return content.analyzed || cleanHtmlForDisplay(content.raw, 8000)
      case 'tables':
        return financialTables.length > 0 
          ? financialTables.map((table, idx) => `表格 ${idx + 1}:\n${cleanHtmlForDisplay(table, 1500)}`).join('\n\n---\n\n')
          : '未找到财务表格数据'
      default:
        return content.analyzed
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {filing.companyName} ({filing.ticker})
          </h3>
          <div className="text-sm text-gray-500">
            {filing.formType} • {new Date(filing.filedAt).toLocaleDateString('zh-CN')}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            title={showPreview ? '隐藏预览' : '显示预览'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <button
            onClick={downloadContent}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            title="下载HTML文件"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            title={isFullscreen ? '退出全屏' : '全屏查看'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round(metadata.contentLength / 1000)}K
            </div>
            <div className="text-xs text-gray-600">原始内容</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {metadata.tablesFound}
            </div>
            <div className="text-xs text-gray-600">财务表格</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {metadata.sectionsFound}
            </div>
            <div className="text-xs text-gray-600">关键部分</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              {Math.round(metadata.analyzedLength / 1000)}K
            </div>
            <div className="text-xs text-gray-600">分析内容</div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="p-4 border-b">
        <div className="flex space-x-1">
          {[
            { key: 'analyzed', label: '智能摘要', count: Math.round(metadata.analyzedLength / 1000) },
            { key: 'tables', label: '财务表格', count: financialTables.length },
            { key: 'raw', label: '原始内容', count: Math.round(metadata.contentLength / 1000) }
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key as 'raw' | 'analyzed' | 'tables')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === mode.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {mode.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                {mode.count}{mode.key === 'raw' || mode.key === 'analyzed' ? 'K' : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Display */}
      {showPreview && (
        <div className={`p-4 ${isFullscreen ? 'h-[calc(100vh-300px)] overflow-y-auto' : 'max-h-96 overflow-y-auto'}`}>
          {viewMode === 'tables' ? (
            <div className="space-y-4">
              {financialTables.length > 0 ? (
                financialTables.map((table, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">财务表格 {idx + 1}</h4>
                    <div 
                      className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto"
                      dangerouslySetInnerHTML={{ 
                        __html: table.substring(0, 1500) + (table.length > 1500 ? '...' : '')
                      }} 
                    />
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>在此文件中未找到标准财务表格</p>
                  <p className="text-sm mt-1">请尝试查看&quot;智能摘要&quot;或&quot;原始内容&quot;</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {viewMode === 'analyzed' && content.sections.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">识别的关键部分:</h4>
                  <div className="flex flex-wrap gap-2">
                    {content.sections.map((section, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={`text-sm ${viewMode === 'raw' ? 'font-mono' : ''} text-gray-700 whitespace-pre-wrap leading-relaxed`}>
                {getDisplayContent()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <div>
          内容来源: SEC EDGAR • 最后更新: {new Date().toLocaleString('zh-CN')}
        </div>
        <div>
          {viewMode === 'analyzed' && '✨ 已通过AI处理优化显示'}
          {viewMode === 'tables' && `📊 显示 ${financialTables.length} 个财务表格`}
          {viewMode === 'raw' && '📄 显示原始HTML内容'}
        </div>
      </div>
    </div>
  )
}

// Fix missing FileText import
import { FileText } from 'lucide-react'