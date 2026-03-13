'use client'

import { useRef } from 'react'
import {
  Chrome,
  Download,
  Shield,
  Zap,
  Globe,
  Terminal,
  ArrowRight,
  MonitorSmartphone,
  Plug,
  Eye,
  Settings,
  CheckCircle2,
} from 'lucide-react'
import Starfield from './Starfield'
import LandingNavbar from './LandingNavbar'
import FooterSection from './FooterSection'

const EXTENSION_VERSION = '1.0.2'
const EXTENSION_ZIP = `/quantwise-browser-relay-v${EXTENSION_VERSION}.zip`

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
      className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 pt-20"
      onMouseMove={handleMouseMove}
    >
      <div
        ref={glowRef}
        className="fixed w-96 h-96 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-15"
        style={{
          background:
            'radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(99,102,241,0.1) 40%, transparent 70%)',
          zIndex: 1,
        }}
      />

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-8">
          <Chrome className="h-3.5 w-3.5 text-cyan-400" />
          Chrome Extension · v{EXTENSION_VERSION}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
          Your AI Assistant,{' '}
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400">
            Across All Your Tabs
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          QuantWise Browser Relay connects your terminal to the browser,
          enabling AI-powered navigation, form filling, and page inspection
          — all through natural language commands.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href={EXTENSION_ZIP}
            download
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-sm
              hover:from-cyan-400 hover:to-indigo-400 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/30"
          >
            <Download className="h-4 w-4" />
            Download Extension
          </a>
          <a
            href="#install"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold text-sm
              hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Settings className="h-4 w-4" />
            Installation Guide
          </a>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { icon: Shield, label: 'Local Only', desc: 'No data leaves your machine' },
            { icon: Zap, label: 'Zero Latency', desc: 'Direct DevTools connection' },
            { icon: Globe, label: 'Any Website', desc: 'Works on all tabs' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <item.icon className="h-5 w-5 text-cyan-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: MonitorSmartphone,
      title: 'Browser Automation',
      description:
        'Navigate pages, click elements, fill forms, and extract data — all controlled by QuantWise from your terminal.',
    },
    {
      icon: Plug,
      title: 'Chrome DevTools Protocol',
      description:
        'Full CDP access enables powerful debugging, DOM inspection, network monitoring, and JavaScript execution.',
    },
    {
      icon: Eye,
      title: 'Page Inspection',
      description:
        'Read page content, capture screenshots, and analyze DOM structure for AI-powered understanding of any webpage.',
    },
    {
      icon: Shield,
      title: 'Secure by Design',
      description:
        'All communication happens locally via WebSocket on 127.0.0.1. Token-based authentication ensures only your QuantWise instance connects.',
    },
    {
      icon: Terminal,
      title: 'Terminal-First',
      description:
        'No context switching. Control your browser directly from QuantWise commands without leaving the terminal.',
    },
    {
      icon: Zap,
      title: 'Auto-Reconnect',
      description:
        'Smart reconnection with exponential backoff ensures the relay stays connected even through tab navigation and browser restarts.',
    },
  ]

  return (
    <section className="relative z-10 py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The Browser Relay extension bridges QuantWise and Chrome through the DevTools Protocol,
            giving your AI assistant full browser control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5
                hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
            >
              <feature.icon className="h-8 w-8 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArchitectureDiagram() {
  return (
    <section className="relative z-10 py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Architecture
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A simple, secure relay between your terminal and browser.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
          {/* QuantWise Terminal */}
          <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/20 w-48">
            <Terminal className="h-10 w-10 text-cyan-400 mb-3" />
            <div className="text-sm font-semibold text-white">QuantWise</div>
            <div className="text-xs text-gray-500 mt-1">Terminal CLI</div>
          </div>

          {/* Arrow */}
          <div className="flex items-center px-4 text-gray-600">
            <div className="hidden sm:block w-12 h-px bg-gradient-to-r from-cyan-500/50 to-indigo-500/50" />
            <ArrowRight className="h-4 w-4 text-indigo-400 hidden sm:block" />
            <ArrowRight className="h-4 w-4 text-indigo-400 rotate-90 sm:hidden" />
          </div>

          {/* Relay */}
          <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 w-48">
            <Plug className="h-10 w-10 text-indigo-400 mb-3" />
            <div className="text-sm font-semibold text-white">WebSocket</div>
            <div className="text-xs text-gray-500 mt-1">127.0.0.1:18792</div>
          </div>

          {/* Arrow */}
          <div className="flex items-center px-4 text-gray-600">
            <div className="hidden sm:block w-12 h-px bg-gradient-to-r from-indigo-500/50 to-violet-500/50" />
            <ArrowRight className="h-4 w-4 text-violet-400 hidden sm:block" />
            <ArrowRight className="h-4 w-4 text-violet-400 rotate-90 sm:hidden" />
          </div>

          {/* Browser */}
          <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20 w-48">
            <Chrome className="h-10 w-10 text-violet-400 mb-3" />
            <div className="text-sm font-semibold text-white">Browser Relay</div>
            <div className="text-xs text-gray-500 mt-1">Chrome Extension</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InstallSection() {
  const steps = [
    {
      step: '1',
      title: 'Download the Extension',
      description: (
        <>
          Click the download button above or{' '}
          <a href={EXTENSION_ZIP} download className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
            download here
          </a>{' '}
          to get the <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">.zip</code> file.
        </>
      ),
    },
    {
      step: '2',
      title: 'Unzip the File',
      description: (
        <>
          Extract the downloaded <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">.zip</code> to a folder on your computer. Keep this folder — Chrome needs it to stay available.
        </>
      ),
    },
    {
      step: '3',
      title: 'Open Chrome Extensions',
      description: (
        <>
          Navigate to{' '}
          <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">chrome://extensions</code>{' '}
          in your browser and enable <strong className="text-white">Developer mode</strong> (toggle in the top right).
        </>
      ),
    },
    {
      step: '4',
      title: 'Load Unpacked Extension',
      description: (
        <>
          Click <strong className="text-white">&quot;Load unpacked&quot;</strong> and select the folder where you extracted the extension files.
        </>
      ),
    },
    {
      step: '5',
      title: 'Configure the Relay',
      description: (
        <>
          Right-click the extension icon → <strong className="text-white">Options</strong>. Set the relay port
          (default: <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">18792</code>) and paste your auth token.
        </>
      ),
    },
    {
      step: '6',
      title: 'Connect & Go',
      description: (
        <>
          Click the extension icon on any tab to attach. The badge turns{' '}
          <span className="text-green-400 font-medium">green</span> when connected.
          Now use QuantWise browser commands from your terminal!
        </>
      ),
    },
  ]

  return (
    <section id="install" className="relative z-10 py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Installation Guide
          </h2>
          <p className="text-gray-400">
            Set up the Browser Relay in under a minute.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="flex gap-5 p-5 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RequirementsSection() {
  const requirements = [
    'Google Chrome or Chromium-based browser (Edge, Brave, Arc)',
    'QuantWise CLI installed and running',
    'BROWSER_RELAY_TOKEN configured in your .env',
    'Developer mode enabled in Chrome extensions',
  ]

  return (
    <section className="relative z-10 py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border border-indigo-500/10">
          <h2 className="text-2xl font-bold text-white mb-6">Requirements</h2>
          <ul className="space-y-3">
            {requirements.map((req) => (
              <li key={req} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative z-10 py-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Connect?
        </h2>
        <p className="text-gray-400 mb-8">
          Download the extension and bring QuantWise intelligence to every tab.
        </p>
        <a
          href={EXTENSION_ZIP}
          download
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-sm
            hover:from-cyan-400 hover:to-indigo-400 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/30"
        >
          <Download className="h-4 w-4" />
          Download Browser Relay v{EXTENSION_VERSION}
        </a>
      </div>
    </section>
  )
}

export default function ChromeExtensionPage() {
  return (
    <div className="bg-[rgb(10,10,30)] min-h-screen text-white overflow-x-hidden">
      <Starfield />
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <ArchitectureDiagram />
      <InstallSection />
      <RequirementsSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}
