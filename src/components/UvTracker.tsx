'use client'

import { useEffect } from 'react'

export default function UvTracker() {
  useEffect(() => {
    // 记录页面访问
    const recordVisit = async () => {
      try {
        await fetch('/api/uv-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: window.location.pathname
          })
        })
      } catch (error) {
        console.error('Failed to record visit:', error)
      }
    }

    // 延迟一秒后记录，避免影响页面加载
    const timer = setTimeout(recordVisit, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // 这个组件不渲染任何内容
  return null
}