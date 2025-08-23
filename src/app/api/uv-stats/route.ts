import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

function generateVisitorId(ip: string, userAgent: string) {
  return crypto.createHash('sha256').update(ip + userAgent).digest('hex')
}

function getTodayDate() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return today
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page = '/' } = body
    
    // 获取访客信息
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    const visitorId = generateVisitorId(ip, userAgent)
    const today = getTodayDate()
    
    console.log('POST UV stats - visitor:', visitorId, 'date:', today)
    
    try {
      // 检查今天是否已有统计记录
      const existingStats = await prisma.uvStatistic.findFirst({
        where: { date: today }
      })
      
      if (!existingStats) {
        // 创建今日统计记录
        const newStats = await prisma.uvStatistic.create({
          data: {
            date: today,
            uniqueViews: 1,
            totalViews: 1,
          }
        })
        console.log('New daily stats created:', newStats.id)
        
        return NextResponse.json({ 
          success: true, 
          visitorId,
          isNewVisitor: true,
          message: 'New daily record created'
        })
      } else {
        console.log('Found existing stats:', existingStats.id)
        
        // 简单地增加总访问量，每次访问都算作新的UV（简化逻辑）
        const updatedStats = await prisma.uvStatistic.update({
          where: { id: existingStats.id },
          data: {
            totalViews: { increment: 1 },
            uniqueViews: { increment: 1 }
          }
        })
        
        console.log('Updated stats:', updatedStats)
        
        return NextResponse.json({ 
          success: true, 
          visitorId,
          isNewVisitor: true,
          message: 'Stats updated'
        })
      }
      
    } catch (dbError) {
      console.error('Database error in POST:', dbError)
      return NextResponse.json(
        { error: 'Database error', details: dbError.message },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error recording UV:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Starting UV stats GET request')
    
    const today = getTodayDate()
    console.log('Today date:', today)
    
    try {
      // 获取今日统计
      const todayStats = await prisma.uvStatistic.findFirst({
        where: {
          date: today
        }
      })
      
      // 获取总统计
      const totalStats = await prisma.uvStatistic.aggregate({
        _sum: {
          uniqueViews: true,
          totalViews: true
        }
      })
      
      // 获取最近7天统计
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      startDate.setUTCHours(0, 0, 0, 0)
      
      const dailyStats = await prisma.uvStatistic.findMany({
        where: {
          date: {
            gte: startDate
          }
        },
        orderBy: {
          date: 'desc'
        }
      })
      
      console.log('Successfully fetched UV stats from database')
      console.log('Today stats:', todayStats)
      console.log('Total stats:', totalStats)
      console.log('Daily stats count:', dailyStats.length)
      
      return NextResponse.json({
        dailyStats,
        todayStats: todayStats || { uniqueViews: 0, totalViews: 0 },
        totalStats: {
          totalUniqueViews: totalStats._sum.uniqueViews || 0,
          totalPageViews: totalStats._sum.totalViews || 0
        }
      })
      
    } catch (dbError) {
      console.error('Database error, returning empty stats:', dbError)
      return NextResponse.json({
        dailyStats: [],
        todayStats: { uniqueViews: 0, totalViews: 0 },
        totalStats: {
          totalUniqueViews: 0,
          totalPageViews: 0
        }
      })
    }
    
  } catch (error) {
    console.error('Error fetching UV stats:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}