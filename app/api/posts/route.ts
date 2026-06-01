import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const platform = searchParams.get('platform')
  const pillar = searchParams.get('pillar')
  const search = searchParams.get('search')
  const date = searchParams.get('date')

  const where: Record<string, unknown> = { userId: session.userId }
  if (status) where.status = status
  if (platform) where.platform = platform
  if (pillar) where.pillar = pillar
  if (search) where.content = { contains: search }
  if (date) {
    const d = new Date(date)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    where.scheduledAt = { gte: d, lt: next }
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { mediaFiles: { include: { mediaFile: true } } },
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const post = await prisma.post.create({
    data: {
      userId: session.userId,
      content: data.content || '',
      title: data.title || '',
      status: data.status || 'draft',
      platform: data.platform || 'tg',
      pillar: data.pillar || 'expertise',
      hashtags: data.hashtags || '',
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    },
  })
  return NextResponse.json(post)
}
