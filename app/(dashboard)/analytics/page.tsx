import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'

export default async function AnalyticsPage() {
  const session = await getSession()
  if (!session) return null
  const [data, postStats] = await Promise.all([
    prisma.analytics.findMany({ where: { userId: session.userId }, orderBy: { date: 'asc' } }),
    prisma.post.groupBy({ by: ['pillar'], where: { userId: session.userId }, _count: { id: true } }),
  ])
  return <AnalyticsClient data={JSON.parse(JSON.stringify(data))} postStats={JSON.parse(JSON.stringify(postStats))} />
}
