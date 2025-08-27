import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, McpCategory, McpStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') as McpStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sort') || 'popularityScore';
    const sortOrder = searchParams.get('order') || 'desc';

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: {
      category?: McpCategory;
      status?: McpStatus;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
        author?: { contains: string; mode: 'insensitive' };
        topics?: { hasSome: string[] };
      }>;
    } = {};
    
    if (category && category !== 'ALL') {
      where.category = category as McpCategory;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { topics: { hasSome: [search] } },
      ];
    }

    // 获取总数
    const total = await prisma.mcpApp.count({ where });

    // 获取数据
    const apps = await prisma.mcpApp.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc',
      },
      select: {
        id: true,
        name: true,
        fullName: true,
        description: true,
        category: true,
        githubUrl: true,
        homepage: true,
        author: true,
        stars: true,
        forks: true,
        issues: true,
        lastUpdated: true,
        createdAt: true,
        language: true,
        license: true,
        topics: true,
        isOfficial: true,
        popularityScore: true,
        status: true,
        syncedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        apps,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching MCP apps:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch MCP apps' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 手动添加MCP应用
    const app = await prisma.mcpApp.create({
      data: {
        name: body.name,
        fullName: body.fullName,
        description: body.description,
        category: body.category || McpCategory.OTHER,
        githubUrl: body.githubUrl,
        homepage: body.homepage,
        author: body.author,
        stars: body.stars || 0,
        forks: body.forks || 0,
        issues: body.issues || 0,
        lastUpdated: new Date(body.lastUpdated || Date.now()),
        createdAt: new Date(body.createdAt || Date.now()),
        language: body.language,
        license: body.license,
        topics: body.topics || [],
        readme: body.readme,
        isOfficial: body.isOfficial || false,
        popularityScore: body.popularityScore || 0,
        status: body.status || McpStatus.ACTIVE,
      }
    });

    return NextResponse.json({
      success: true,
      data: app
    });
  } catch (error) {
    console.error('Error creating MCP app:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create MCP app' },
      { status: 500 }
    );
  }
}