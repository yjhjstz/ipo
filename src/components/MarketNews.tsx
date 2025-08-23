'use client'

import { useState, useEffect } from 'react'
import { NewspaperIcon, ExternalLinkIcon, ClockIcon } from 'lucide-react'

interface NewsItem {
  id: number
  headline: string
  summary: string
  url: string
  image: string
  datetime: number
  category: string
  source: string
}

interface MarketNewsProps {
  limit?: number
  showFullList?: boolean
}

export default function MarketNews({ limit = 5, showFullList = false }: MarketNewsProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(showFullList)

  useEffect(() => {
    fetchNews()
  }, []) // 移除 limit 依赖，避免重复请求

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/news?category=general&limit=20`) // 获取更多新闻用于显示
      if (!response.ok) throw new Error('Failed to fetch news')
      
      const data = await response.json()
      setNews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market news')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const displayedNews = expanded ? news : news.slice(0, limit)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <NewspaperIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Latest Market News</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <NewspaperIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Latest Market News</h3>
        </div>
        <div className="text-red-600 text-center py-4">
          <p>{error}</p>
          <button
            onClick={fetchNews}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <NewspaperIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Latest Market News</h3>
          </div>
          <button
            onClick={fetchNews}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-0">
        {displayedNews.length > 0 ? (
          <div className="space-y-0">
            {displayedNews.map((item, index) => (
              <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <div className="flex space-x-4">
                  {item.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {item.headline}
                    </h4>
                    
                    {item.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.summary}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatTimeAgo(item.datetime)}
                        </span>
                        <span>{item.source}</span>
                      </div>
                      
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                      >
                        Read more
                        <ExternalLinkIcon className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <NewspaperIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>No market news available</p>
          </div>
        )}

        {!showFullList && news.length > limit && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {expanded ? `Show only ${limit}` : `Show all ${news.length} articles`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}