'use client'

import { useScrollReveal } from './useScrollReveal'

const LAYERS = [
  {
    name: 'Entry Layer',
    color: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-500/30',
    items: ['CLI Interface', 'Slash Commands', 'Natural Language Input'],
  },
  {
    name: 'Core Engine',
    color: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/30',
    items: ['Claude API', 'Query Orchestration', 'Context Collection'],
  },
  {
    name: 'Tool System',
    color: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/30',
    items: ['36+ Built-in Tools', 'Bash · File Ops · Web', 'Browser · Debugger · Psql'],
  },
  {
    name: 'Agent Layer',
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30',
    items: ['Subagent Delegation', 'Plan Mode', 'Task Management'],
  },
  {
    name: 'Extension Layer',
    color: 'from-pink-500/20 to-pink-500/5',
    border: 'border-pink-500/30',
    items: ['MCP Protocol', 'Plugin Market', '30+ Trading Skills'],
  },
]

function LayerRow({ layer, index, isLast }: { layer: typeof LAYERS[0]; index: number; isLast: boolean }) {
  const { ref, isRevealed } = useScrollReveal()

  return (
    <div ref={ref}>
      <div
        className={`relative rounded-xl border ${layer.border} bg-gradient-to-r ${layer.color} p-5
          transition-all duration-600 ease-out
          ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ transitionDelay: `${index * 120}ms` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-shrink-0 w-40">
            <span className="text-white font-semibold text-sm">{layer.name}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {layer.items.map((item) => (
              <span
                key={item}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="flex justify-center py-1">
          <div className="w-px h-3 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      )}
    </div>
  )
}

export default function ArchitectureSection() {
  const { ref, isRevealed } = useScrollReveal()

  return (
    <section id="architecture" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Five-Tier <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Architecture</span>
          </h2>
          <p className="text-gray-400 text-lg">
            A layered system designed for extensibility and power.
          </p>
        </div>

        <div className="space-y-3">
          {LAYERS.map((layer, i) => (
            <LayerRow key={layer.name} layer={layer} index={i} isLast={i === LAYERS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
