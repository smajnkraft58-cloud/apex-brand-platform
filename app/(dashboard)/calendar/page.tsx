import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CalendarClient } from '@/components/calendar/CalendarClient'

export default async function CalendarPage() {
  const session = await getSession()
  if (!session) return null
  const posts = await prisma.post.findMany({
    where: { userId: session.userId, scheduledAt: { not: null } },
    orderBy: { scheduledAt: 'asc' },
  })
  return <CalendarClient initialPosts={JSON.parse(JSON.stringify(posts))} />
}
