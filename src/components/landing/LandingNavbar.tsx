'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, Menu, X, Github } from 'lucide-react'

const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#architecture', label: 'Architecture' },
  { href: '/docs', label: 'Docs' },
  { href: '/chrome-extension', label: 'Extension' },
  { href: '/#get-started', label: 'Quick Start' },
  { href: '/#support', label: 'Support' },
]

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgb(10,10,30)]/85 backdrop-blur-xl shadow-lg shadow-indigo-500/5 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Zap className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="text-lg font-bold text-white tracking-tight">
              Quant<span className="text-cyan-400">Wise</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) =>
              link.href.startsWith('/') ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              <a
                href="https://github.com/quantumiodb/quantwise"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.npmjs.com/package/quantwise"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                title="npm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.499h-3.464l.01-10.026h-3.456L12.04 18.84H5.113z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[rgb(10,10,30)]/95 backdrop-blur-xl border-t border-white/5 pb-4">
          {NAV_LINKS.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.href}
                href={link.href}
                className="block px-6 py-3 text-sm text-gray-400 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="block px-6 py-3 text-sm text-gray-400 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          <div className="flex items-center gap-4 px-6 pt-3 mt-2 border-t border-white/5">
            <a
              href="https://github.com/quantumiodb/quantwise"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/quantwise"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.499h-3.464l.01-10.026h-3.456L12.04 18.84H5.113z" />
              </svg>
              npm
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
