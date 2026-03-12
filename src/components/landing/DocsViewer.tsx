'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Zap, ChevronRight, Menu, X, ArrowLeft, Search } from 'lucide-react'

interface DocEntry {
  slug: string
  title: string
  category: string
}

interface DocsViewerProps {
  categories: Record<string, DocEntry[]>
  docs: Record<string, string>
}

export default function DocsViewer({ categories, docs }: DocsViewerProps) {
  const [activeSlug, setActiveSlug] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const content = docs[activeSlug] || '# Not Found\n\nDocument not found.'

  // Filter docs by search
  const filteredCategories: Record<string, DocEntry[]> = {}
  for (const [cat, entries] of Object.entries(categories)) {
    const filtered = entries.filter(e =>
      !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (filtered.length > 0) filteredCategories[cat] = filtered
  }

  // Close sidebar on selection (mobile)
  const selectDoc = (slug: string) => {
    setActiveSlug(slug)
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-[rgb(10,10,30)] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 h-14 bg-[rgb(10,10,30)]/90 backdrop-blur-xl border-b border-white/5 flex items-center px-4 gap-4">
        <button
          className="lg:hidden text-gray-400 hover:text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/" className="flex items-center gap-2 group">
          <Zap className="h-5 w-5 text-cyan-400" />
          <span className="text-sm font-bold text-white">
            Quant<span className="text-cyan-400">Wise</span>
          </span>
        </Link>
        <span className="text-gray-600 text-sm">/</span>
        <span className="text-gray-400 text-sm">Docs</span>
        <div className="flex-1" />
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
          <ArrowLeft size={12} /> Home
        </Link>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-72 bg-[rgb(12,12,32)] border-r border-white/5 overflow-y-auto
            transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Search */}
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/8 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/30"
              />
            </div>
          </div>

          <nav className="p-3 space-y-4">
            {Object.entries(filteredCategories).map(([category, entries]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1.5">
                  {category}
                </h3>
                <ul className="space-y-0.5">
                  {entries.map((entry) => (
                    <li key={entry.slug}>
                      <button
                        onClick={() => selectDoc(entry.slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${
                          activeSlug === entry.slug
                            ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                      >
                        <ChevronRight className={`h-3 w-3 flex-shrink-0 ${activeSlug === entry.slug ? 'text-cyan-400' : 'text-gray-600'}`} />
                        <span className="truncate">{entry.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-16 py-8 max-w-4xl">
          <article className="docs-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-white/10">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mt-10 mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-white mt-8 mb-3">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold text-gray-200 mt-6 mb-2">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2" target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>{children}</a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside ml-6 mb-4 space-y-1.5 text-gray-300">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside ml-6 mb-4 space-y-1.5 text-gray-300">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-semibold">{children}</strong>
                ),
                code: ({ className, children }) => {
                  const isBlock = className?.includes('language-')
                  if (isBlock || (typeof children === 'string' && children.includes('\n'))) {
                    return (
                      <code className={`block text-sm ${className || ''}`}>{children}</code>
                    )
                  }
                  return (
                    <code className="px-1.5 py-0.5 bg-white/8 rounded text-cyan-300 text-sm font-mono">{children}</code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="bg-[rgb(6,6,20)] border border-white/8 rounded-lg p-4 mb-4 overflow-x-auto text-sm font-mono text-gray-300">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-cyan-500/40 pl-4 my-4 text-gray-400 italic">{children}</blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-white/5">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-gray-300 font-semibold border-b border-white/10">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-gray-400 border-b border-white/5">{children}</td>
                ),
                hr: () => <hr className="my-8 border-white/10" />,
                img: ({ src, alt }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={alt || ''} className="rounded-lg border border-white/10 my-4 max-w-full" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </main>
      </div>
    </div>
  )
}
