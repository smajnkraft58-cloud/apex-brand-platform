import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tasks = await prisma.task.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { post: true },
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const task = await prisma.task.create({
    data: {
      userId: session.userId,
      title: data.title,
      tag: data.tag || '',
      deadline: data.deadline ? new Date(data.deadline) : null,
      postId: data.postId || null,
    },
  })
  return NextResponse.json(task)
}
