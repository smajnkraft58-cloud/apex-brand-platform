import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await prisma.analytics.findMany({
    where: { userId: session.userId },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const entry = await prisma.analytics.create({
    data: {
      userId: session.userId,
      platform: data.platform,
      date: new Date(data.date),
      subscribers: data.subscribers || 0,
      reach: data.reach || 0,
      likes: data.likes || 0,
      posts: data.posts || 0,
    },
  })
  return NextResponse.json(entry)
}
