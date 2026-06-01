import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TasksClient } from '@/components/tasks/TasksClient'

export default async function TasksPage() {
  const session = await getSession()
  if (!session) return null
  const tasks = await prisma.task.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { post: true },
  })
  return <TasksClient initialTasks={JSON.parse(JSON.stringify(tasks))} />
}
