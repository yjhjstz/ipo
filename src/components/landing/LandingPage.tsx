'use client'

import { useRef, useEffect, useState } from 'react'
import { Terminal, ArrowDown } from 'lucide-react'
import Starfield from './Starfield'
import LandingNavbar from './LandingNavbar'
import FeaturesSection from './FeaturesSection'
import ArchitectureSection from './ArchitectureSection'
import GettingStartedSection from './GettingStartedSection'
import SupportSection from './SupportSection'
import FooterSection from './FooterSection'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const start = performance.now()
          const duration = 2000

          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - t, 3) // ease-out cubic
            setCount(Math.floor(ease * target))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}

function HeroSection() {
  const glowRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (glowRef.current) {
      glowRef.current.style.left = `${e.clientX}px`
      glowRef.current.style.top = `${e.clientY}px`
    }
  }

  return (
    <section
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20"
      onMouseMove={handleMouseMove}
    >
      {/* Mouse glow */}
      <div
        ref={glowRef}
        className="fixed w-96 h-96 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(99,102,241,0.1) 40%, transparent 70%)',
          zIndex: 1,
        }}
      />

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Open Source · Full-Featured · Production-Grade
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
          More Than a CLI,{' '}
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400">
            A Complete AI Platform
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          An agentic coding & trading intelligence tool that lives in your terminal.
          Built on Claude, it understands your codebase and provides market analysis
          — all through natural language commands.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="#get-started"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-sm
              hover:from-cyan-400 hover:to-indigo-400 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/30"
          >
            Get Started
          </a>
          <a
            href="/docs"
            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold text-sm
              hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Terminal className="inline h-4 w-4 mr-2 -mt-0.5" />
            Documentation
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-2xl mx-auto">
          {[
            { value: 36, suffix: '+', label: 'Built-in Tools' },
            { value: 30, suffix: '+', label: 'Trading Skills' },
            { value: 25, suffix: '+', label: 'MCP Extensions' },
            { value: 5, suffix: '', label: 'Architecture Tiers' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 animate-bounce text-gray-600">
        <ArrowDown className="h-5 w-5" />
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="bg-[rgb(10,10,30)] min-h-screen text-white overflow-x-hidden">
      <Starfield />
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <ArchitectureSection />
      <GettingStartedSection />
      <SupportSection />
      <FooterSection />
    </div>
  )
}
