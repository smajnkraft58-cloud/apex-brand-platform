'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, CheckCircle2, Clock, Archive, Flame, Plus, ArrowRight, Send } from 'lucide-react'
import { Post, Task } from '@/types'
import { PLATFORM_CONFIG, STATUS_CONFIG } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

interface Props {
  stats: { total: number; published: number; scheduled: number; drafts: number }
  todayPosts: Post[]
  recentDrafts: Post[]
  tasks: Task[]
  streak: number
}

export function DashboardClient({ stats, todayPosts, recentDrafts, tasks, streak }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [quickText, setQuickText] = useState('')
  const [creating, setCreating] = useState(false)

  async function createQuickPost() {
    if (!quickText.trim()) return
    setCreating(true)
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: quickText, status: 'draft', platform: 'tg' }),
    })
    if (res.ok) {
      const post = await res.json()
      toast('Черновик создан')
      router.push(`/posts/${post.id}`)
    }
    setCreating(false)
  }

  const statCards = [
    { label: 'Всего постов', value: stats.total, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Опубликовано', value: stats.published, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'В очереди', value: stats.scheduled, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Черновики', value: stats.drafts, icon: Archive, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Дашборд</h1>
          <p className="text-white/40 text-sm mt-1">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2">
            <Flame size={18} className="text-orange-400" />
            <span className="text-orange-400 font-bold text-lg">{streak}</span>
            <span className="text-orange-400/70 text-sm">дней подряд</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white/5 border border-white/5 rounded-2xl p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick create */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Быстрый пост</h2>
        <div className="flex gap-3">
          <textarea
            value={quickText}
            onChange={e => setQuickText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) createQuickPost() }}
            placeholder="Напиши мысль, идею или текст поста... (⌘+Enter для сохранения)"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm resize-none focus:outline-none focus:border-[#2B5CE6]/50 transition-colors"
            rows={2}
          />
          <Button onClick={createQuickPost} disabled={creating || !quickText.trim()} className="self-end">
            <Send size={16} />
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Today */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Сегодня</h2>
            <Link href="/calendar" className="text-xs text-[#5B8AF8] hover:underline flex items-center gap-1">
              Календарь <ArrowRight size={12} />
            </Link>
          </div>
          {todayPosts.length === 0 ? (
            <div className="text-center py-8 text-white/25 text-sm">
              <Clock size={32} className="mx-auto mb-2 opacity-30" />
              На сегодня ничего не запланировано
            </div>
          ) : (
            <div className="space-y-2">
              {todayPosts.map(post => (
                <Link key={post.id} href={`/posts/${post.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <span className="text-lg">{PLATFORM_CONFIG[post.platform]?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 truncate">{post.title || post.content.slice(0, 60)}</div>
                    <div className="text-xs text-white/30">{PLATFORM_CONFIG[post.platform]?.label}</div>
                  </div>
                  <Badge className={STATUS_CONFIG[post.status]?.color}>{STATUS_CONFIG[post.status]?.label}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Drafts */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Черновики</h2>
            <Link href="/posts?status=draft" className="text-xs text-[#5B8AF8] hover:underline flex items-center gap-1">
              Все <ArrowRight size={12} />
            </Link>
          </div>
          {recentDrafts.length === 0 ? (
            <div className="text-center py-8 text-white/25 text-sm">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              Черновиков пока нет
            </div>
          ) : (
            <div className="space-y-2">
              {recentDrafts.map(post => (
                <Link key={post.id} href={`/posts/${post.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="text-lg">{PLATFORM_CONFIG[post.platform]?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/80 truncate">{post.title || post.content.slice(0, 60) || 'Без текста'}</div>
                    <div className="text-xs text-white/30">{formatDate(post.updatedAt)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="col-span-2 bg-white/5 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Задачи</h2>
            <Link href="/tasks" className="text-xs text-[#5B8AF8] hover:underline flex items-center gap-1">
              Все задачи <ArrowRight size={12} />
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-white/25 text-sm">Задач нет — отличный день!</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                  <div className="w-4 h-4 rounded-md border border-white/20" />
                  <span className="text-sm text-white/70 flex-1 truncate">{task.title}</span>
                  {task.tag && <Badge className="bg-white/10 text-white/40 text-xs">{task.tag}</Badge>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
