import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateIpoStock } from '@/types/ipo'

export async function GET() {
  try {
    const stocks = await prisma.ipoStock.findMany({
      where: {
        status: {
          not: 'WITHDRAWN'
        }
      },
      orderBy: [
        {
          status: 'asc' // UPCOMING comes before others alphabetically
        },
        {
          ipoDate: 'desc' // Then by IPO date descending (latest first)
        },
        {
          createdAt: 'desc' // Finally by creation date for records without IPO date
        }
      ]
    })
    return NextResponse.json(stocks)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateIpoStock = await request.json()
    
    const stock = await prisma.ipoStock.create({
      data: {
        ...data,
        ipoDate: data.ipoDate ? new Date(data.ipoDate) : null,
      }
    })
    
    return NextResponse.json(stock, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create stock' }, { status: 500 })
  }
}