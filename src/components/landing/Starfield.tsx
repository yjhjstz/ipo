'use client'

import { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  pulse: number
  pulseSpeed: number
  color: [number, number, number]
}

const COLORS: [number, number, number][] = [
  [99, 102, 241],   // indigo
  [34, 211, 238],   // cyan
  [167, 139, 250],  // violet
  [59, 130, 246],   // blue
  [139, 92, 246],   // purple
]

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let w = window.innerWidth
    let h = window.innerHeight

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)
    }
    resize()

    const count = w < 768 ? 120 : 250
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.3 + 0.05),
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('resize', resize)

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.speedX
        p.y += p.speedY
        p.pulse += p.pulseSpeed

        // Wrap around
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        // Mouse parallax
        const dx = (mouseRef.current.x - w / 2) * 0.0003
        const dy = (mouseRef.current.y - h / 2) * 0.0003
        const drawX = p.x + dx * p.size * 20
        const drawY = p.y + dy * p.size * 20

        const pulseOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse))
        const [r, g, b] = p.color

        // Glow
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.size * 4)
        gradient.addColorStop(0, `rgba(${r},${g},${b},${pulseOpacity * 0.3})`)
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = gradient
        ctx.arc(drawX, drawY, p.size * 4, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.fillStyle = `rgba(${r},${g},${b},${pulseOpacity})`
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
