'use client'

import { Heart, Mail, MessageCircle } from 'lucide-react'
import { useScrollReveal } from './useScrollReveal'

const TIERS = [
  { name: 'Supporter', price: '$5', period: '/month', desc: 'Help keep QuantWise growing. Get early access to new features.' },
  { name: 'Builder', price: '$25', period: '/month', desc: 'Priority support, exclusive trading skills, and beta access.', featured: true },
  { name: 'Company', price: '$100', period: '/month', desc: 'Team license, dedicated support, and custom skill development.' },
]

export default function SupportSection() {
  const { ref, isRevealed } = useScrollReveal()

  return (
    <section id="support" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            <Heart className="inline h-8 w-8 text-pink-400 mr-2 -mt-1" />
            Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">QuantWise</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Your support helps us build better tools for developers and traders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {TIERS.map((tier, i) => {
            return <TierCard key={tier.name} tier={tier} index={i} />
          })}
        </div>

        {/* Contact */}
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-sm">Have questions or need help?</p>
          <a
            href="mailto:yjhjstz@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all text-sm"
          >
            <Mail className="h-4 w-4 text-cyan-400" />
            yjhjstz@gmail.com
          </a>
        </div>
      </div>
    </section>
  )
}

function TierCard({ tier, index }: { tier: typeof TIERS[0]; index: number }) {
  const { ref, isRevealed } = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`rounded-xl p-6 border transition-all duration-500 ease-out text-center
        ${tier.featured
          ? 'bg-gradient-to-b from-indigo-500/15 to-transparent border-indigo-500/30 shadow-lg shadow-indigo-500/10'
          : 'bg-[rgb(15,15,40)]/60 border-white/10 hover:border-white/20'
        }
        ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {tier.featured && (
        <span className="inline-block text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
          Popular
        </span>
      )}
      <h3 className="text-white font-semibold text-lg">{tier.name}</h3>
      <div className="my-3">
        <span className="text-3xl font-bold text-white">{tier.price}</span>
        <span className="text-gray-500 text-sm">{tier.period}</span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{tier.desc}</p>
    </div>
  )
}
