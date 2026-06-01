import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'apex-secret'

export function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: string; email: string }
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('apex_token')?.value
  if (!token) return null
  return verifyToken(token)
}
