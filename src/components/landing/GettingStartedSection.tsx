'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useScrollReveal } from './useScrollReveal'

const STEPS = [
  {
    num: '01',
    title: 'Install',
    desc: 'Install globally via npm or download the standalone binary.',
    code: 'npm install -g quantwise',
    alt: 'curl -fsSL https://quantumio.com.cn/api/install.sh | bash',
  },
  {
    num: '02',
    title: 'Configure',
    desc: 'Set your Anthropic API key to connect to Claude.',
    code: 'export ANTHROPIC_API_KEY=sk-ant-...',
  },
  {
    num: '03',
    title: 'Launch',
    desc: 'Start QuantWise and begin coding with AI intelligence.',
    code: 'quantwise',
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-all"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const { ref, isRevealed } = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="flex gap-5">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/20 flex items-center justify-center">
          <span className="text-cyan-400 font-bold text-sm font-mono">{step.num}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">{step.title}</h3>
          <p className="text-gray-400 text-sm mb-3">{step.desc}</p>
          <div className="relative rounded-lg bg-[rgb(12,12,30)] border border-white/8 overflow-hidden">
            <pre className="p-4 pr-12 text-sm text-cyan-300 font-mono overflow-x-auto">
              <code>{step.code}</code>
            </pre>
            <CopyButton text={step.code} />
          </div>
          {step.alt && (
            <div className="relative mt-2 rounded-lg bg-[rgb(12,12,30)] border border-white/8 overflow-hidden">
              <pre className="p-4 pr-12 text-sm text-gray-500 font-mono overflow-x-auto">
                <code># or standalone binary{'\n'}{step.alt}</code>
              </pre>
              <CopyButton text={step.alt} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GettingStartedSection() {
  const { ref, isRevealed } = useScrollReveal()

  return (
    <section id="get-started" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Get Started in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">60 Seconds</span>
          </h2>
          <p className="text-gray-400 text-lg">Three commands. That&apos;s all you need.</p>
        </div>

        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span className="text-green-400">✓</span> Then try:
            <code className="px-2 py-1 bg-white/5 rounded text-cyan-400 font-mono text-xs">/stock AAPL</code>
            <code className="px-2 py-1 bg-white/5 rounded text-cyan-400 font-mono text-xs">/canslim-screener</code>
            <code className="px-2 py-1 bg-white/5 rounded text-cyan-400 font-mono text-xs">/weekly-trade-strategy</code>
          </div>
        </div>
      </div>
    </section>
  )
}
