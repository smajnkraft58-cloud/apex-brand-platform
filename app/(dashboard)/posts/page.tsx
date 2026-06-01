import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PostsClient } from '@/components/posts/PostsClient'

export default async function PostsPage() {
  const session = await getSession()
  if (!session) return null
  const posts = await prisma.post.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })
  return <PostsClient initialPosts={JSON.parse(JSON.stringify(posts))} />
}
