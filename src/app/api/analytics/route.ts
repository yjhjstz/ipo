import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const market = searchParams.get('market')
    const status = searchParams.get('status')
    
    // Filter out WITHDRAWN status by default
    const whereClause = {
      status: {
        not: 'WITHDRAWN' as const
      },
      ...(market && { market: market as 'US' | 'HK' }),
      ...(status && { status: status as 'UPCOMING' | 'PRICING' | 'LISTED' | 'POSTPONED' })
    }
    
    const stats = await prisma.ipoStock.groupBy({
      by: ['status', 'market'],
      _count: {
        id: true
      },
      where: whereClause
    })

    const totalsByMarket = await prisma.ipoStock.groupBy({
      by: ['market'],
      _count: { id: true },
      _avg: { expectedPrice: true },
      _sum: { sharesOffered: true },
      where: {
        status: {
          not: 'WITHDRAWN' as const
        }
      }
    })

    // Get upcoming IPOs in the next 30 days instead of recent listings
    const upcomingIpos = await prisma.ipoStock.findMany({
      where: {
        status: {
          in: ['UPCOMING', 'PRICING']
        },
        ipoDate: {
          gte: new Date(),
          lte: new Date(new Date().setDate(new Date().getDate() + 30))
        }
      },
      orderBy: { ipoDate: 'asc' },
      take: 10
    })

    // Get monthly IPO count trend (last 6 months)
    const monthlyTrend = await prisma.ipoStock.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        status: {
          not: 'WITHDRAWN' as const
        },
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      }
    })

    return NextResponse.json({
      stats,
      totalsByMarket,
      upcomingIpos,
      monthlyTrend
    })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}