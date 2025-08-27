'use client'

import { useState, useEffect } from 'react'
import { TrendingUpIcon, RefreshCwIcon, ExternalLinkIcon, ClockIcon } from 'lucide-react'

interface SearchResult {
  title: string
  url: string
  date?: string
  last_updated?: string
}

interface TrendingStartupsResponse {
  search_results: SearchResult[]
  last_updated: string
}

interface TrendingAIStartupsProps {
  limit?: number
  compact?: boolean
}

export default function TrendingAIStartups({ 
  limit = 5,
  compact = false 
}: TrendingAIStartupsProps) {
  const [startupsData, setStartupsData] = useState<TrendingStartupsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStartups()
  }, [])

  const fetchStartups = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/trending-ai-startups')
      if (!response.ok) throw new Error('Failed to fetch trending AI startups')
      
      const data = await response.json()
      setStartupsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trending AI startups')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    
    const now = new Date()
    const date = new Date(dateString)
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return `${Math.floor(days / 30)}m ago`
  }

  const getSourceFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '').split('.')[0]
    } catch {
      return 'Unknown'
    }
  }

  const isWithinOneWeek = (dateString?: string) => {
    if (!dateString) return false
    
    const now = new Date()
    const date = new Date(dateString)
    const diffTime = now.getTime() - date.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    
    return diffDays <= 7
  }

  const filterRecentResults = (results: SearchResult[]) => {
    return results.filter(result => isWithinOneWeek(result.last_updated))
  }

  const displayedResults = startupsData?.search_results 
    ? filterRecentResults(startupsData.search_results).slice(0, limit)
    : []

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <TrendingUpIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Trending AI </h3>
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
          <TrendingUpIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Trending AI </h3>
        </div>
        <div className="text-red-600 text-center py-4">
          <p>{error}</p>
          <button
            onClick={fetchStartups}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <TrendingUpIcon className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-gray-900">Trending AI Articles</span>
          </div>
          <button
            onClick={fetchStartups}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-2 py-1 border-none outline-none transition-colors"
            disabled={loading}
          >
            <RefreshCwIcon className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {displayedResults.length > 0 ? (
          <div className="space-y-2">
            {displayedResults.slice(0, 2).map((result, index) => (
              <div key={index} className="text-sm">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline block truncate text-gray-900"
                >
                  {result.title}
                </a>
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>{getSourceFromUrl(result.url)}</span>
                  <span>{formatTimeAgo(result.last_updated || result.date)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recent articles (within 1 week)</p>
        )}
        <div className="text-xs text-gray-400 mt-2">
          Updated: {startupsData?.last_updated ? new Date(startupsData.last_updated).toLocaleDateString() : 'Unknown'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUpIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Trending AI Articles</h3>
          </div>
          <button
            onClick={fetchStartups}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            disabled={loading}
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-0">
        {displayedResults.length > 0 ? (
          <div className="space-y-0">
            {displayedResults.map((result, index) => (
              <div
                key={index}
                className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex space-x-4">
                  {/* No image section for search results, but maintain layout consistency */}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                      {result.title}
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatTimeAgo(result.last_updated || result.date)}
                        </span>
                        <span>{getSourceFromUrl(result.url)}</span>
                      </div>
                      
                      <a
                        href={result.url}
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
            <TrendingUpIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>No recent articles (within 1 week)</p>
          </div>
        )}
        
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
          Last updated: {startupsData?.last_updated ? new Date(startupsData.last_updated).toLocaleString() : 'Unknown'}
        </div>
      </div>
    </div>
  )
}
