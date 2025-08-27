'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, ExternalLink, Star, GitFork, AlertCircle, RefreshCw, Github } from 'lucide-react'

interface McpApp {
  id: string
  name: string
  fullName: string
  description?: string
  category: string
  githubUrl: string
  homepage?: string
  author: string
  stars: number
  forks: number
  issues: number
  lastUpdated: string
  createdAt: string
  language?: string
  license?: string
  topics: string[]
  isOfficial: boolean
  popularityScore: number
  status: string
  syncedAt: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

const categoryMap: Record<string, string> = {
  'DEVELOPMENT': '开发工具',
  'PRODUCTIVITY': '生产力',
  'DATA_ANALYSIS': '数据分析',
  'CLOUD_SERVICES': '云服务',
  'AI_ML': 'AI/ML',
  'AUTOMATION': '自动化',
  'SECURITY': '安全',
  'COMMUNICATION': '通信',
  'CREATIVE': '创意',
  'FINANCE': '金融',
  'ENTERPRISE': '企业',
  'TESTING': '测试',
  'DATABASE': '数据库',
  'WEB_SCRAPING': '网页抓取',
  'OTHER': '其他'
}

const statusMap: Record<string, { label: string; color: string }> = {
  'ACTIVE': { label: '活跃', color: 'bg-green-100 text-green-800' },
  'DEPRECATED': { label: '已弃用', color: 'bg-gray-100 text-gray-800' },
  'EXPERIMENTAL': { label: '实验性', color: 'bg-yellow-100 text-yellow-800' },
  'ARCHIVED': { label: '已归档', color: 'bg-red-100 text-red-800' }
}

export default function Home() {
  const [apps, setApps] = useState<McpApp[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('popularityScore')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  const fetchApps = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortBy,
        order: sortOrder,
        ...(selectedCategory !== 'ALL' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
      })
      
      const response = await fetch(`/api/mcp?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setApps(result.data.apps)
        setPagination(result.data.pagination)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Failed to fetch MCP apps:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncMcpData = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/mcp/sync', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        // 同步成功后重新加载数据
        await fetchApps(currentPage)
        alert(`同步完成！共同步了 ${result.data.totalSynced} 个项目`)
      } else {
        alert(`同步失败: ${result.error}`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      alert('同步失败，请稍后重试')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchApps(1)
  }, [searchTerm, selectedCategory, sortBy, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchApps(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const formatScore = (score: number) => {
    return score.toFixed(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">MCP 应用</h1>
          <button
            onClick={syncMcpData}
            disabled={syncing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '同步数据'}
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          发现和探索最新、最热门的 Model Context Protocol (MCP) 应用和服务器
        </p>

        {/* 搜索和筛选 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索 MCP 应用..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </form>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">所有分类</option>
                {Object.entries(categoryMap).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">排序:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="popularityScore">热度</option>
                <option value="stars">Stars</option>
                <option value="lastUpdated">最近更新</option>
                <option value="createdAt">创建时间</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        {pagination && (
          <div className="text-sm text-gray-600 mb-4">
            共找到 {pagination.total} 个 MCP 应用
          </div>
        )}
      </div>

      {/* 应用列表 */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无 MCP 应用数据</p>
          <button
            onClick={syncMcpData}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            同步数据
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {app.name}
                      </h3>
                      {app.isOfficial && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          官方
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusMap[app.status]?.color || statusMap.ACTIVE.color}`}>
                        {statusMap[app.status]?.label || '活跃'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{app.author}</span> / {app.fullName.split('/')[1]}
                    </div>
                    
                    {app.description && (
                      <p className="text-gray-700 mb-3">{app.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{app.stars}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        <span>{app.forks}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{app.issues}</span>
                      </div>
                      {app.language && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {app.language}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {categoryMap[app.category] || app.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        热度: {formatScore(app.popularityScore)}
                      </span>
                    </div>
                    
                    {app.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {app.topics.slice(0, 5).map((topic) => (
                          <span key={topic} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {topic}
                          </span>
                        ))}
                        {app.topics.length > 5 && (
                          <span className="text-xs text-gray-500">+{app.topics.length - 5} 更多</span>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      最后更新: {formatDate(app.lastUpdated)} • 
                      创建于: {formatDate(app.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <a
                      href={app.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                    {app.homepage && (
                      <a
                        href={app.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        访问
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => fetchApps(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = Math.max(1, currentPage - 2) + i
              if (page > pagination.pages) return null
              
              return (
                <button
                  key={page}
                  onClick={() => fetchApps(page)}
                  className={`px-3 py-1 border border-gray-300 rounded text-sm ${
                    page === currentPage 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => fetchApps(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}