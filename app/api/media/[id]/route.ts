import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs/promises'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const file = await prisma.mediaFile.findFirst({ where: { id, userId: session.userId } })
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    await fs.unlink(path.join(process.cwd(), 'public', file.url))
  } catch { /* ignore if already deleted */ }

  await prisma.mediaFile.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
