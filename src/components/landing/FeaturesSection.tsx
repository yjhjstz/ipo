'use client'

import { useRef, useCallback } from 'react'
import {
  Terminal, Brain, TrendingUp, LineChart, Shield,
  GitBranch, Globe, Puzzle, BarChart3, Cpu,
  FileSearch, Newspaper, Bot, Layers, Zap,
  Database, Sparkles
} from 'lucide-react'
import { useScrollReveal } from './useScrollReveal'

const FEATURES = [
  { icon: Terminal, title: 'Terminal Native', desc: 'Lives in your terminal. No IDE required. Works anywhere you have a shell.' },
  { icon: Brain, title: 'Claude AI Engine', desc: 'Powered by Claude — understands context, writes code, and reasons about your codebase.' },
  { icon: TrendingUp, title: '30+ Trading Skills', desc: 'CANSLIM screener, VCP patterns, options advisor, institutional flow tracking, and more.' },
  { icon: FileSearch, title: 'Codebase Understanding', desc: 'Reads, searches, and navigates your entire codebase to give contextual answers.' },
  { icon: LineChart, title: 'Technical Analysis', desc: 'Terminal candlestick charts, RSI, MACD, Bollinger Bands — all from your CLI.' },
  { icon: Shield, title: 'Market Intelligence', desc: 'Market top detection, bubble analysis, macro regime shifts, and breadth scoring.' },
  { icon: GitBranch, title: 'Git Integration', desc: 'Commit, diff, review PRs, create branches — all through natural language.' },
  { icon: Globe, title: 'Web & Browser', desc: 'Fetch URLs, search the web, control headless browsers, take screenshots.' },
  { icon: Puzzle, title: 'MCP Extensions', desc: 'Model Context Protocol support for Notion, GitHub, Slack, and custom integrations.' },
  { icon: BarChart3, title: 'Portfolio Manager', desc: 'Holdings analysis, risk metrics, sector allocation, and rebalancing suggestions.' },
  { icon: Cpu, title: 'Multi-Model Support', desc: 'Claude Opus, Sonnet, Haiku — plus AWS Bedrock and Google Vertex AI backends.' },
  { icon: Bot, title: 'Subagent System', desc: 'Delegate tasks to specialized agents that work in parallel on complex problems.' },
  { icon: Layers, title: 'Plan Mode', desc: 'Strategic planning and execution — break down complex tasks before coding.' },
  { icon: Zap, title: '36+ Built-in Tools', desc: 'Bash, file ops, grep, glob, debugging, PostgreSQL, Jupyter — everything built in.' },
  { icon: Database, title: 'Session Memory', desc: 'Named sessions, tags, and resume functionality. Pick up right where you left off.' },
  { icon: Newspaper, title: 'Weekly Strategies', desc: 'Auto-generated weekly trading strategies combining technical + fundamental analysis.' },
  { icon: Sparkles, title: 'Plugin Market', desc: 'Extensible plugin ecosystem for custom tools, commands, and workflows.' },
]

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { ref, isRevealed } = useScrollReveal()

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (card) card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)'
  }, [])

  const Icon = feature.icon

  return (
    <div ref={ref}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`group relative p-6 rounded-xl border border-indigo-500/15 bg-[rgb(15,15,40)]/60 backdrop-blur-sm
          hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10
          transition-all duration-500 ease-out cursor-default
          ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionDelay: `${index * 60}ms`, willChange: 'transform' }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:border-indigo-400/30 transition-colors">
            <Icon className="h-5 w-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FeaturesSection() {
  const { ref, isRevealed } = useScrollReveal()

  return (
    <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">In Your Terminal</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From coding assistance to market intelligence — 17 major capabilities that redefine what a terminal tool can do.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
