import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'Email уже используется' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, password: hashed, name: name || 'Слава Милованов' } })

  const token = signToken({ userId: user.id, email: user.email })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  res.cookies.set('apex_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}
