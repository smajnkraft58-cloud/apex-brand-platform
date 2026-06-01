import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  const task = await prisma.task.updateMany({
    where: { id, userId: session.userId },
    data: {
      ...(data.done !== undefined && { done: data.done }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.tag !== undefined && { tag: data.tag }),
      ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
    },
  })
  return NextResponse.json(task)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.task.deleteMany({ where: { id, userId: session.userId } })
  return NextResponse.json({ ok: true })
}
