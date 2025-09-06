import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma, AIAgentCategory, PricingType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'popularityScore'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    const where: Prisma.AIAgentWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { creator: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    if (category && category !== 'ALL') {
      // Validate that category is a valid AIAgentCategory enum value
      const validCategories = Object.values(AIAgentCategory)
      if (validCategories.includes(category as AIAgentCategory)) {
        where.category = category as AIAgentCategory
      }
    }

    const validSortFields = ['popularityScore', 'rating', 'users', 'createdAt', 'lastUpdated', 'name']
    const sortField = validSortFields.includes(sort) ? sort : 'popularityScore'
    const sortOrder = order === 'asc' ? 'asc' : 'desc'

    const [agents, total] = await Promise.all([
      prisma.aIAgent.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.aIAgent.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        agents,
        pagination: {
          page,
          limit,
          total,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }
    })

  } catch (error) {
    console.error('Error fetching AI agents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI agents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate and type the input data
    const createData: Prisma.AIAgentCreateInput = {
      name: body.name,
      description: body.description || undefined,
      category: (body.category && Object.values(AIAgentCategory).includes(body.category)) 
        ? body.category as AIAgentCategory 
        : AIAgentCategory.OTHER,
      website: body.website || undefined,
      creator: body.creator,
      users: typeof body.users === 'number' ? body.users : 0,
      rating: typeof body.rating === 'number' ? body.rating : 0.0,
      featured: typeof body.featured === 'boolean' ? body.featured : false,
      capabilities: Array.isArray(body.capabilities) ? body.capabilities : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      verified: typeof body.verified === 'boolean' ? body.verified : false,
      pricing: (body.pricing && Object.values(PricingType).includes(body.pricing))
        ? body.pricing as PricingType
        : PricingType.FREE,
      popularityScore: typeof body.popularityScore === 'number' ? body.popularityScore : 0.0,
      lastUpdated: body.lastUpdated ? new Date(body.lastUpdated) : new Date(),
    }
    
    const agent = await prisma.aIAgent.create({
      data: createData
    })

    return NextResponse.json({
      success: true,
      data: agent
    })

  } catch (error) {
    console.error('Error creating AI agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create AI agent' },
      { status: 500 }
    )
  }
}