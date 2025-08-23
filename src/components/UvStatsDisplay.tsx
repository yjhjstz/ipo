'use client'

import { useState, useEffect } from 'react'
import { Eye, Users, TrendingUp } from 'lucide-react'

interface UvStats {
  todayStats: {
    uniqueViews: number
    totalViews: number
  }
  totalStats: {
    totalUniqueViews: number
    totalPageViews: number
  }
  dailyStats: Array<{
    date: string
    uniqueViews: number
    totalViews: number
  }>
}

export default function UvStatsDisplay() {
  const [stats, setStats] = useState<UvStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      console.log('Fetching UV stats...')
      const response = await fetch('/api/uv-stats')
      if (response.ok) {
        const data = await response.json()
        console.log('UV stats data:', data)
        setStats(data)
      } else {
        console.error('Failed to fetch stats:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch UV stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-2 justify-center">
        <div className="bg-white rounded-md shadow-sm p-2 min-w-[90px]">
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm p-2 min-w-[90px]">
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm p-2 min-w-[90px]">
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs text-center">
        <p>无法加载数据</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {/* 今日访问 - 小字体版 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-md shadow-sm px-3 py-1.5 text-white min-w-[90px]">
        <div className="flex items-center">
          <Eye className="h-3 w-3 mr-1.5 opacity-80" />
          <div className="text-center">
            <p className="text-xs text-blue-100">今日</p>
            <p className="text-sm font-semibold">{stats.todayStats.uniqueViews}UV</p>
          </div>
        </div>
      </div>

      {/* 累计访问 - 小字体版 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-md shadow-sm px-3 py-1.5 text-white min-w-[90px]">
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1.5 opacity-80" />
          <div className="text-center">
            <p className="text-xs text-green-100">累计</p>
            <p className="text-sm font-semibold">{stats.totalStats.totalUniqueViews}UV</p>
          </div>
        </div>
      </div>

      {/* 七日平均 - 小字体版 */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-md shadow-sm px-3 py-1.5 text-white min-w-[90px]">
        <div className="flex items-center">
          <TrendingUp className="h-3 w-3 mr-1.5 opacity-80" />
          <div className="text-center">
            <p className="text-xs text-purple-100">日均</p>
            <p className="text-sm font-semibold">
              {stats.dailyStats.length > 0 
                ? Math.round(stats.dailyStats.reduce((acc, day) => acc + day.uniqueViews, 0) / Math.max(stats.dailyStats.length, 1))
                : 0
              }UV
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}