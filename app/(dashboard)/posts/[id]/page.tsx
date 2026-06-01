import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PostEditor } from '@/components/editor/PostEditor'
import { notFound } from 'next/navigation'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return null
  const { id } = await params
  const post = await prisma.post.findFirst({
    where: { id, userId: session.userId },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 5 } },
  })
  if (!post) notFound()
  return <PostEditor initialPost={JSON.parse(JSON.stringify(post))} />
}
