import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const post = await prisma.post.findFirst({
    where: { id, userId: session.userId },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 5 }, mediaFiles: { include: { mediaFile: true } } },
  })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()

  const existing = await prisma.post.findFirst({ where: { id, userId: session.userId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (data.content && data.content !== existing.content) {
    const versionCount = await prisma.postVersion.count({ where: { postId: id } })
    if (versionCount >= 5) {
      const oldest = await prisma.postVersion.findFirst({ where: { postId: id }, orderBy: { createdAt: 'asc' } })
      if (oldest) await prisma.postVersion.delete({ where: { id: oldest.id } })
    }
    await prisma.postVersion.create({ data: { postId: id, content: existing.content } })
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(data.content !== undefined && { content: data.content }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.platform !== undefined && { platform: data.platform }),
      ...(data.pillar !== undefined && { pillar: data.pillar }),
      ...(data.hashtags !== undefined && { hashtags: data.hashtags }),
      ...(data.scheduledAt !== undefined && { scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null }),
      ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt ? new Date(data.publishedAt) : null }),
    },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 5 }, mediaFiles: { include: { mediaFile: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const post = await prisma.post.findFirst({ where: { id, userId: session.userId } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
