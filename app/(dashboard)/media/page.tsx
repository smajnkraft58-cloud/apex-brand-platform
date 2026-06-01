import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MediaClient } from '@/components/media/MediaClient'

export default async function MediaPage() {
  const session = await getSession()
  if (!session) return null
  const files = await prisma.mediaFile.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })
  return <MediaClient initialFiles={JSON.parse(JSON.stringify(files))} />
}
