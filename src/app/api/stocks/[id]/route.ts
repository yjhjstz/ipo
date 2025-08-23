import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stock = await prisma.ipoStock.findUnique({
      where: { id: params.id }
    })
    
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
    }
    
    return NextResponse.json(stock)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    const stock = await prisma.ipoStock.update({
      where: { id: params.id },
      data: {
        ...data,
        ipoDate: data.ipoDate ? new Date(data.ipoDate) : null,
      }
    })
    
    return NextResponse.json(stock)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.ipoStock.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Stock deleted successfully' })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to delete stock' }, { status: 500 })
  }
}