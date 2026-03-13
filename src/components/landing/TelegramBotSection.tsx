'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MessageCircle, X } from 'lucide-react'
import { useScrollReveal } from './useScrollReveal'

const SCREENSHOTS = [
  {
    src: '/images/telegram/bot-news-1.jpg',
    title: 'Financial News Digest',
    desc: 'AI-powered 24h financial news summary with market impact assessment',
  },
  {
    src: '/images/telegram/bot-news-2.jpg',
    title: 'Market Data & Risk Analysis',
    desc: 'Key indices, risk levels, and sector impact at a glance',
  },
  {
    src: '/images/telegram/bot-english.jpg',
    title: 'Daily English Lessons',
    desc: 'Practical English expressions with context, examples, and pronunciation',
  },
]

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
      >
        <X className="h-8 w-8" />
      </button>
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          width={400}
          height={800}
          className="max-h-[90vh] w-auto rounded-2xl shadow-2xl object-contain cursor-zoom-out"
          onClick={onClose}
          quality={95}
        />
      </div>
    </div>
  )
}

function ScreenshotCard({
  item,
  index,
  onOpen,
}: {
  item: (typeof SCREENSHOTS)[0]
  index: number
  onOpen: () => void
}) {
  const { ref, isRevealed } = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`group transition-all duration-700 ease-out ${
        isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Phone frame */}
      <div
        className="relative mx-auto w-[260px] sm:w-[280px] cursor-zoom-in"
        onClick={onOpen}
      >
        {/* Outer glow on hover */}
        <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-b from-cyan-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

        {/* Phone body */}
        <div className="relative rounded-[2rem] bg-gradient-to-b from-gray-700 to-gray-800 p-[3px] shadow-2xl shadow-black/50 group-hover:shadow-cyan-500/10 transition-shadow duration-500">
          <div className="rounded-[1.85rem] bg-black overflow-hidden">
            {/* Notch */}
            <div className="relative h-7 bg-black flex items-center justify-center">
              <div className="w-20 h-5 bg-black rounded-b-xl" />
            </div>

            {/* Screenshot */}
            <div className="relative aspect-[9/19.5]">
              <Image
                src={item.src}
                alt={item.title}
                fill
                className="object-cover object-top"
                sizes="280px"
                quality={85}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="mt-6 text-center px-2">
        <h3 className="text-white font-semibold mb-1">{item.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
      </div>
    </div>
  )
}

export default function TelegramBotSection() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const { ref, isRevealed } = useScrollReveal()

  return (
    <>
      <section id="telegram-bot" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            ref={ref}
            className={`text-center mb-16 transition-all duration-700 ${
              isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-6">
              <MessageCircle className="h-3.5 w-3.5 text-cyan-400" />
              Telegram Integration
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Intelligence Delivered to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                Telegram
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Automated financial news digests, market analysis, and daily learning
              — pushed directly to your Telegram via scheduled cron tasks.
            </p>
          </div>

          {/* Screenshots grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 justify-items-center">
            {SCREENSHOTS.map((item, i) => (
              <ScreenshotCard
                key={item.src}
                item={item}
                index={i}
                onOpen={() => setLightboxIdx(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          src={SCREENSHOTS[lightboxIdx].src}
          alt={SCREENSHOTS[lightboxIdx].title}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  )
}
