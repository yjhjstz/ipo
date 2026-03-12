'use client'

import { Zap } from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Quick Start', href: '#get-started' },
    { label: 'Documentation', href: '/docs' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Contact', href: 'mailto:yjhjstz@gmail.com' },
  ],
  Trading: [
    { label: 'CANSLIM Screener', href: '#features' },
    { label: 'Options Advisor', href: '#features' },
    { label: 'Portfolio Manager', href: '#features' },
    { label: 'Weekly Strategy', href: '#features' },
  ],
}

export default function FooterSection() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[rgb(6,6,20)]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-cyan-400" />
              <span className="text-white font-bold">
                Quant<span className="text-cyan-400">Wise</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Agentic coding & trading intelligence in your terminal. Built on Claude AI.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} QuantWise. Built with Next.js & Claude AI.
          </p>
          <p className="text-xs text-gray-600">
            quantumio.com.cn
          </p>
        </div>
      </div>
    </footer>
  )
}
