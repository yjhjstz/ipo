'use client'

import { useState, useEffect } from 'react'
import { CloudIcon, RefreshCwIcon, ThermometerIcon, DropletsIcon, WindIcon } from 'lucide-react'

interface WeatherData {
  location: string
  temp_C: string
  weatherDesc: string
  humidity: string
  windspeedKmph: string
  weatherIcon: string
}

interface WeatherProps {
  city?: string
  compact?: boolean
}

export default function Weather({ city = '', compact = false }: WeatherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
      if (!res.ok) throw new Error('Failed to fetch weather')
      const data = await res.json()
      const current = data.current_condition?.[0]
      const area = data.nearest_area?.[0]
      if (!current) throw new Error('No weather data')
      setWeather({
        location: area ? `${area.areaName[0].value}, ${area.country[0].value}` : city || 'Unknown',
        temp_C: current.temp_C,
        weatherDesc: current.weatherDesc[0].value,
        humidity: current.humidity,
        windspeedKmph: current.windspeedKmph,
        weatherIcon: getWeatherEmoji(current.weatherCode),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [city])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <CloudIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Weather</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <CloudIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Weather</h3>
        </div>
        <div className="text-red-600 text-center py-4">
          <p>{error}</p>
          <button onClick={fetchWeather} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
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
            <CloudIcon className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-gray-900">Weather</span>
          </div>
          <button
            onClick={fetchWeather}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-2 py-1 border-none outline-none transition-colors"
          >
            <RefreshCwIcon className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {weather && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{weather.weatherIcon}</span>
              <span className="text-2xl font-bold text-gray-900">{weather.temp_C}°C</span>
            </div>
            <p className="text-sm text-gray-600">{weather.weatherDesc}</p>
            <p className="text-xs text-gray-500 mt-1">{weather.location}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <DropletsIcon className="h-3 w-3" /> {weather.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <WindIcon className="h-3 w-3" /> {weather.windspeedKmph} km/h
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CloudIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Weather</h3>
          </div>
          <button
            onClick={fetchWeather}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      {weather && (
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{weather.weatherIcon}</span>
            <div>
              <div className="text-4xl font-bold text-gray-900">{weather.temp_C}°C</div>
              <p className="text-gray-600">{weather.weatherDesc}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">{weather.location}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DropletsIcon className="h-4 w-4 text-blue-500" />
              <span>Humidity: {weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <WindIcon className="h-4 w-4 text-blue-500" />
              <span>Wind: {weather.windspeedKmph} km/h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getWeatherEmoji(code: string): string {
  const c = parseInt(code)
  if (c === 113) return '☀️'
  if (c === 116) return '⛅'
  if (c === 119 || c === 122) return '☁️'
  if ([143, 248, 260].includes(c)) return '🌫️'
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 311, 314, 353, 356, 359].includes(c)) return '🌧️'
  if ([179, 182, 185, 227, 230, 281, 284, 317, 320, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377, 392, 395].includes(c)) return '🌨️'
  if ([200, 386, 389].includes(c)) return '⛈️'
  return '🌤️'
}
