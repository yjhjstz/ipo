import LandingPage from '@/components/landing/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QuantWise - AI Coding & Trading Intelligence in Your Terminal',
  description: 'An agentic coding & trading intelligence tool that lives in your terminal. Built on Claude, it understands your codebase and provides market analysis — all through natural language commands.',
  openGraph: {
    title: 'QuantWise - AI Coding & Trading Intelligence',
    description: 'More than a CLI. A complete AI coding & trading platform in your terminal.',
    type: 'website',
  },
}

export default function Home() {
  return <LandingPage />
}
