'use client'

import { useState, useEffect } from 'react'
import { CalendarDaysIcon, MapPinIcon, ClockIcon } from 'lucide-react'

interface MarketHoliday {
  eventName: string
  atDate: string
  countryCode: string
  exchangeCode: string
  tradingHour: string | null
}

interface MarketHolidaysResponse {
  exchange: string
  holidays: MarketHoliday[]
}

interface MarketHolidaysProps {
  exchange?: 'US' | 'HK'
  limit?: number
  compact?: boolean
}

export default function MarketHolidays({ 
  exchange = 'US', 
  limit = 5,
  compact = false 
}: MarketHolidaysProps) {
  const [holidaysData, setHolidaysData] = useState<MarketHolidaysResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExchange, setSelectedExchange] = useState(exchange)

  useEffect(() => {
    fetchHolidays()
  }, [selectedExchange])

  const fetchHolidays = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/market-holidays?exchange=${selectedExchange}`)
      if (!response.ok) throw new Error('Failed to fetch market holidays')
      
      const data = await response.json()
      setHolidaysData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market holidays')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    const holidayDate = new Date(dateString)
    const diffTime = holidayDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '明天'
    if (diffDays < 7) return `${diffDays} 天后`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周后`
    return `${Math.floor(diffDays / 30)} 个月后`
  }

  const getCountryFlag = (countryCode: string) => {
    switch (countryCode) {
      case 'US': return '🇺🇸'
      case 'HK': return '🇭🇰'
      case 'CN': return '🇨🇳'
      case 'GB': return '🇬🇧'
      case 'JP': return '🇯🇵'
      default: return '🌍'
    }
  }

  const displayedHolidays = holidaysData?.holidays.slice(0, limit) || []

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Market Holidays</h3>
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
          <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Market Holidays</h3>
        </div>
        <div className="text-red-600 text-center py-4">
          <p>{error}</p>
          <button
            onClick={fetchHolidays}
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
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            <span className="text-sm font-semibold">Next Market Holiday</span>
          </div>
          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value as 'US' | 'HK')}
            className="text-xs bg-white bg-opacity-20 text-white rounded px-2 py-1 border-none outline-none"
          >
            <option value="US" className="text-gray-900">🇺🇸 US</option>
            <option value="HK" className="text-gray-900">🇭🇰 HK</option>
          </select>
        </div>
        {displayedHolidays.length > 0 ? (
          <div className="space-y-2">
            {displayedHolidays.slice(0, 2).map((holiday, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{holiday.eventName}</div>
                  <div className="text-xs opacity-90">{formatDate(holiday.atDate)}</div>
                </div>
                <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  {getDaysUntil(holiday.atDate)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-90">No upcoming holidays</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Market Holidays</h3>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value as 'US' | 'HK')}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-blue-500"
            >
              <option value="US">🇺🇸 US Market</option>
              <option value="HK">🇭🇰 HK Market</option>
            </select>
            <button
              onClick={fetchHolidays}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-0">
        {displayedHolidays.length > 0 ? (
          <div className="space-y-0">
            {displayedHolidays.map((holiday, index) => (
              <div
                key={index}
                className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <span className="text-xl">{getCountryFlag(holiday.countryCode)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {holiday.eventName}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-3 w-3 mr-1" />
                          {formatDate(holiday.atDate)}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {holiday.exchangeCode}
                        </div>
                        {holiday.tradingHour && (
                          <div className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {holiday.tradingHour}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      {getDaysUntil(holiday.atDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(holiday.atDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p>No upcoming market holidays</p>
          </div>
        )}
      </div>
    </div>
  )
}