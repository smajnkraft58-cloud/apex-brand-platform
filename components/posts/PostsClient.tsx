'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, Grid3X3, List, Copy, Trash2, Edit3, Calendar } from 'lucide-react'
import { Post, Platform, PostStatus, ContentPillar, PLATFORM_CONFIG, STATUS_CONFIG, PILLAR_CONFIG } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate, truncate } from '@/lib/utils'

const PLATFORMS: { value: Platform | ''; label: string }[] = [
  { value: '', label: 'Все площадки' },
  { value: 'tg', label: 'Telegram' },
  { value: 'inst', label: 'Instagram' },
  { value: 'vk', label: 'ВКонтакте' },
  { value: 'shorts', label: 'YouTube Shorts' },
  { value: 'threads', label: 'Threads' },
  { value: 'vc', label: 'VC.ru' },
  { value: 'dzen', label: 'Яндекс Дзен' },
]

const STATUSES: { value: PostStatus | ''; label: string }[] = [
  { value: '', label: 'Все статусы' },
  { value: 'idea', label: 'Идея' },
  { value: 'draft', label: 'Черновик' },
  { value: 'ready', label: 'Готов' },
  { value: 'scheduled', label: 'Запланирован' },
  { value: 'published', label: 'Опубликован' },
  { value: 'archive', label: 'Архив' },
]

const PILLARS: { value: ContentPillar | ''; label: string }[] = [
  { value: '', label: 'Все столпы' },
  { value: 'expertise', label: 'Экспертиза' },
  { value: 'numbers', label: 'Цифры' },
  { value: 'bts', label: 'BTS' },
  { value: 'personal', label: 'Личность' },
]

export function PostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [posts, setPosts] = useState(initialPosts)
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState<Platform | ''>('')
  const [status, setStatus] = useState<PostStatus | ''>('')
  const [pillar, setPillar] = useState<ContentPillar | ''>('')
  const [view, setView] = useState<'list' | 'grid'>('list')

  const filtered = useMemo(() => posts.filter(p => {
    if (search && !p.content.toLowerCase().includes(search.toLowerCase()) && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (platform && p.platform !== platform) return false
    if (status && p.status !== status) return false
    if (pillar && p.pillar !== pillar) return false
    return true
  }), [posts, search, platform, status, pillar])

  async function deletePost(id: string) {
    if (!confirm('Удалить пост?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== id))
    toast('Пост удалён')
  }

  async function clonePost(id: string) {
    const res = await fetch(`/api/posts/${id}/clone`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    if (res.ok) {
      const clone = await res.json()
      setPosts(prev => [clone, ...prev])
      toast('Пост скопирован')
      router.push(`/posts/${clone.id}`)
    }
  }

  const select = 'bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors'

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Контент-хаб</h1>
          <p className="text-white/40 text-sm mt-1">{posts.length} постов</p>
        </div>
        <Link href="/posts/new">
          <Button><Plus size={16} />Новый пост</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по тексту..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors"
          />
        </div>
        <select value={platform} onChange={e => setPlatform(e.target.value as Platform | '')} className={select}>
          {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value as PostStatus | '')} className={select}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={pillar} onChange={e => setPillar(e.target.value as ContentPillar | '')} className={select}>
          {PILLARS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          <button onClick={() => setView('list')} className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/30'}`}><List size={16} /></button>
          <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/30'}`}><Grid3X3 size={16} /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/25">
          <p className="text-lg mb-2">Постов нет</p>
          <p className="text-sm">Создайте первый пост или измените фильтры</p>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-2">
          {filtered.map(post => (
            <div key={post.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
              <span className="text-2xl">{PLATFORM_CONFIG[post.platform]?.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white/90 truncate">{post.title || post.content.slice(0, 80) || 'Без текста'}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/30">{PLATFORM_CONFIG[post.platform]?.label}</span>
                  <span className="text-white/10">·</span>
                  <span className="text-xs text-white/30">{formatDate(post.createdAt)}</span>
                </div>
              </div>
              <Badge className={PILLAR_CONFIG[post.pillar]?.color}>{PILLAR_CONFIG[post.pillar]?.label}</Badge>
              <Badge className={STATUS_CONFIG[post.status]?.color}>{STATUS_CONFIG[post.status]?.label}</Badge>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/posts/${post.id}`} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit3 size={15} /></Link>
                <button onClick={() => clonePost(post.id)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Copy size={15} /></button>
                <button onClick={() => deletePost(post.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(post => (
            <div key={post.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{PLATFORM_CONFIG[post.platform]?.icon}</span>
                <Badge className={STATUS_CONFIG[post.status]?.color}>{STATUS_CONFIG[post.status]?.label}</Badge>
              </div>
              <p className="text-sm text-white/70 flex-1 mb-3 line-clamp-4">{post.content || 'Без текста'}</p>
              <div className="flex items-center justify-between mt-auto">
                <Badge className={PILLAR_CONFIG[post.pillar]?.color}>{PILLAR_CONFIG[post.pillar]?.label}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/posts/${post.id}`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit3 size={14} /></Link>
                  <button onClick={() => clonePost(post.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Copy size={14} /></button>
                  <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
