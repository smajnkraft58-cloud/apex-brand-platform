import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [total, published, scheduled, drafts, todayPosts, recentDrafts, tasks, streak] = await Promise.all([
    prisma.post.count({ where: { userId: session.userId } }),
    prisma.post.count({ where: { userId: session.userId, status: 'published' } }),
    prisma.post.count({ where: { userId: session.userId, status: 'scheduled' } }),
    prisma.post.count({ where: { userId: session.userId, status: { in: ['draft', 'idea'] } } }),
    prisma.post.findMany({
      where: { userId: session.userId, scheduledAt: { gte: today, lt: tomorrow } },
      orderBy: { scheduledAt: 'asc' },
    }),
    prisma.post.findMany({
      where: { userId: session.userId, status: { in: ['draft', 'idea'] } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: { userId: session.userId, done: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    (async () => {
      const posts = await prisma.post.findMany({
        where: { userId: session.userId, status: 'published', publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        select: { publishedAt: true },
      })
      let count = 0
      let check = new Date()
      check.setHours(0, 0, 0, 0)
      for (const post of posts) {
        if (!post.publishedAt) continue
        const d = new Date(post.publishedAt)
        d.setHours(0, 0, 0, 0)
        if (d.getTime() === check.getTime()) {
          count++
          check.setDate(check.getDate() - 1)
        } else if (d < check) break
      }
      return count
    })(),
  ])

  return (
    <DashboardClient
      stats={{ total, published, scheduled, drafts }}
      todayPosts={JSON.parse(JSON.stringify(todayPosts))}
      recentDrafts={JSON.parse(JSON.stringify(recentDrafts))}
      tasks={JSON.parse(JSON.stringify(tasks))}
      streak={streak}
    />
  )
}
