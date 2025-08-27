import { NextResponse } from 'next/server'
import { createPerplexityAIService } from '@/lib/perplexity-ai'

export async function GET() {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      )
    }

    const perplexityService = createPerplexityAIService()
    const trendingStartups = await perplexityService.getTrendingAIStartups()

    return NextResponse.json(trendingStartups)
  } catch (error) {
    console.error('Error fetching trending AI startups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending AI startups' },
      { status: 500 }
    )
  }
}