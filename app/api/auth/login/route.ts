import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !await bcrypt.compare(password, user.password))
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })

  const token = signToken({ userId: user.id, email: user.email })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  res.cookies.set('apex_token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}
