'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ExternalLink, Star, Users, RefreshCw, Bot, Award } from 'lucide-react'

interface AIAgent {
  id: string
  name: string
  description?: string
  category: string
  website?: string
  creator: string
  users: number
  rating: number
  featured: boolean
  capabilities: string[]
  tags: string[]
  createdAt: string
  lastUpdated: string
  popularityScore: number
  verified: boolean
  pricing: 'FREE' | 'FREEMIUM' | 'PAID'
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
  'PRODUCTIVITY': '生产力',
  'CODING': '编程助手',
  'CONTENT': '内容创作',
  'RESEARCH': '研究分析',
  'CUSTOMER_SERVICE': '客户服务',
  'MARKETING': '营销推广',
  'EDUCATION': '教育培训',
  'FINANCE': '金融理财',
  'HEALTHCARE': '健康医疗',
  'CREATIVE': '创意设计',
  'AUTOMATION': '自动化',
  'ANALYTICS': '数据分析',
  'COMMUNICATION': '沟通协作',
  'ENTERTAINMENT': '娱乐',
  'OTHER': '其他'
}

const pricingMap: Record<string, { label: string; color: string }> = {
  'FREE': { label: '免费', color: 'bg-green-100 text-green-800' },
  'FREEMIUM': { label: '免费试用', color: 'bg-blue-100 text-blue-800' },
  'PAID': { label: '付费', color: 'bg-purple-100 text-purple-800' }
}

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('popularityScore')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  const fetchAgents = useCallback(async (page = 1) => {
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
      
      const response = await fetch(`/api/ai-agents?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setAgents(result.data.agents)
        setPagination(result.data.pagination)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Failed to fetch AI agents:', error)
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder, selectedCategory, searchTerm])

  useEffect(() => {
    fetchAgents(1)
  }, [fetchAgents])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/ai-agents/sync', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.success) {
        fetchAgents(currentPage)
      }
    } catch (error) {
      console.error('Failed to sync AI agents:', error)
    } finally {
      setSyncing(false)
    }
  }

  const handlePageChange = (page: number) => {
    fetchAgents(page)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Bot className="text-blue-600" size={40} />
                热门AI Agent
              </h1>
              <p className="text-lg text-gray-600">
                发现和探索最受欢迎的AI智能助手
              </p>
            </div>
            
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? '同步中...' : '同步数据'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="搜索AI Agent..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">所有分类</option>
              {Object.entries(categoryMap).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
            >
              <option value="popularityScore-desc">热度排序</option>
              <option value="rating-desc">评分最高</option>
              <option value="users-desc">用户最多</option>
              <option value="createdAt-desc">最新发布</option>
              <option value="lastUpdated-desc">最近更新</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        {pagination && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>共找到 {pagination.total} 个AI Agent</span>
              <span>第 {pagination.page} 页，共 {pagination.pages} 页</span>
            </div>
          </div>
        )}

        {/* Agents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        {agent.name}
                        {agent.featured && <Award className="text-yellow-500" size={16} />}
                        {agent.verified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>}
                      </h3>
                      <p className="text-sm text-gray-600">by {agent.creator}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${pricingMap[agent.pricing].color}`}>
                        {pricingMap[agent.pricing].label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {categoryMap[agent.category]}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {agent.description || '暂无描述'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {renderStars(agent.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        {agent.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users size={16} />
                      <span className="text-sm">{formatNumber(agent.users)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {agent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {agent.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {agent.tags.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{agent.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {agent.website && (
                      <a
                        href={agent.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium text-center flex items-center justify-center gap-1 transition-colors"
                      >
                        使用
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2)
                if (page > pagination.pages) return null
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </nav>
          </div>
        )}

        {!loading && agents.length === 0 && (
          <div className="text-center py-12">
            <Bot className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl text-gray-600">没有找到符合条件的AI Agent</p>
            <p className="text-gray-500 mt-2">尝试调整搜索条件或分类筛选</p>
          </div>
        )}
      </div>
    </div>
  )
}