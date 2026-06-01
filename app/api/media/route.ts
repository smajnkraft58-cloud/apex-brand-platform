import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs/promises'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const files = await prisma.mediaFile.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(files)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'drafts'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const ext = file.name.split('.').pop() || ''
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filepath, buffer)

  const mime = file.type
  const type = mime.startsWith('video') ? 'video' : mime.startsWith('image') ? 'image' : 'file'

  const media = await prisma.mediaFile.create({
    data: {
      userId: session.userId,
      name: file.name,
      url: `/uploads/${filename}`,
      type,
      size: file.size,
      folder,
    },
  })
  return NextResponse.json(media)
}
