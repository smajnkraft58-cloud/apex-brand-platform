import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { platform } = await req.json()

  const original = await prisma.post.findFirst({ where: { id, userId: session.userId } })
  if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const clone = await prisma.post.create({
    data: {
      userId: session.userId,
      content: original.content,
      title: `${original.title} (копия)`,
      status: 'draft',
      platform: platform || original.platform,
      pillar: original.pillar,
      hashtags: original.hashtags,
    },
  })
  return NextResponse.json(clone)
}
