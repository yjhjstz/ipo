import type { Metadata } from 'next'
import ChromeExtensionPage from '@/components/landing/ChromeExtensionPage'

export const metadata: Metadata = {
  title: 'QuantWise Browser Relay - Chrome Extension',
  description:
    'Connect QuantWise to your browser tabs. Enable AI-powered browser automation through Chrome DevTools Protocol.',
  openGraph: {
    title: 'QuantWise Browser Relay - Chrome Extension',
    description:
      'Connect QuantWise to your browser tabs for AI-powered browser automation.',
    type: 'website',
  },
}

export default function ChromeExtension() {
  return <ChromeExtensionPage />
}
