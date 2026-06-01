'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Sparkles, Copy, Trash2, Clock, ChevronDown } from 'lucide-react'
import { Post, Platform, PostStatus, ContentPillar, PLATFORM_CONFIG, STATUS_CONFIG, PILLAR_CONFIG } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

const CHAR_LIMITS: Record<Platform, number> = {
  tg: 4096, inst: 2200, vk: 16000, shorts: 500, threads: 500, vc: 50000, dzen: 50000,
}

const SHORTS_SECTIONS = ['🎣 Крючок (0–3 сек)', '📖 Тело (3–45 сек)', '📣 Призыв (45–60 сек)']

export function PostEditor({ initialPost }: { initialPost?: Post & { versions?: { id: string; content: string; createdAt: string }[] } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [postId, setPostId] = useState(initialPost?.id || '')
  const [content, setContent] = useState(initialPost?.content || '')
  const [title, setTitle] = useState(initialPost?.title || '')
  const [platform, setPlatform] = useState<Platform>(initialPost?.platform || 'tg')
  const [status, setStatus] = useState<PostStatus>(initialPost?.status || 'draft')
  const [pillar, setPillar] = useState<ContentPillar>(initialPost?.pillar || 'expertise')
  const [hashtags, setHashtags] = useState(initialPost?.hashtags || '')
  const [scheduledAt, setScheduledAt] = useState(initialPost?.scheduledAt ? initialPost.scheduledAt.slice(0, 16) : '')
  const [versions, setVersions] = useState(initialPost?.versions || [])
  const [showVersions, setShowVersions] = useState(false)
  const [aiImproving, setAiImproving] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const charLimit = CHAR_LIMITS[platform]
  const charCount = content.length
  const charPercent = Math.min((charCount / charLimit) * 100, 100)
  const charColor = charPercent > 90 ? 'text-red-400' : charPercent > 75 ? 'text-yellow-400' : 'text-white/40'

  const save = useCallback(async (silent = false) => {
    setSaving(true)
    const body = { content, title, platform, status, pillar, hashtags, scheduledAt: scheduledAt || null }
    let res: Response
    if (postId) {
      res = await fetch(`/api/posts/${postId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    if (res.ok) {
      const data = await res.json()
      if (!postId) { setPostId(data.id); router.replace(`/posts/${data.id}`) }
      if (data.versions) setVersions(data.versions)
      if (!silent) toast('Сохранено')
    }
    setSaving(false)
  }, [content, title, platform, status, pillar, hashtags, scheduledAt, postId, router, toast])

  useEffect(() => {
    if (!content && !title) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => save(true), 30000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [content, title, save])

  async function improveWithAI() {
    if (!content.trim()) return toast('Сначала напишите текст', 'error')
    setAiImproving(true)
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Улучши этот пост для ${PLATFORM_CONFIG[platform].label}:\n\n${content}`, platform, mode: 'improve' }),
    })
    if (res.ok) {
      const data = await res.json()
      setContent(data.reply)
      toast('Текст улучшен AI')
    } else {
      toast('Ошибка AI. Проверьте API ключ в .env', 'error')
    }
    setAiImproving(false)
  }

  async function deletePost() {
    if (!postId || !confirm('Удалить пост?')) return
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    router.push('/posts')
  }

  const selectClass = 'bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors'

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Заголовок поста (необязательно)"
            className="w-full bg-transparent text-xl font-bold text-white placeholder-white/20 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {postId && (
            <button onClick={deletePost} className="p-2 rounded-xl hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          )}
          <Button onClick={() => save()} disabled={saving}>
            <Save size={15} />
            {saving ? 'Сохраняю...' : 'Сохранить'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="col-span-2">
          {platform === 'shorts' ? (
            <div className="space-y-4">
              {SHORTS_SECTIONS.map(section => (
                <div key={section} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <div className="text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">{section}</div>
                  <textarea
                    placeholder={`Напишите ${section.toLowerCase()}...`}
                    className="w-full bg-transparent text-white/80 text-sm resize-none focus:outline-none placeholder-white/20 min-h-20"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={`Напишите текст для ${PLATFORM_CONFIG[platform].label}...`}
                className="w-full bg-transparent text-white/80 text-sm resize-none focus:outline-none placeholder-white/20 p-5 min-h-80"
                style={{ minHeight: '400px' }}
              />
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
                <span className={`text-xs font-mono ${charColor}`}>
                  {charCount} / {charLimit}
                </span>
                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${charPercent > 90 ? 'bg-red-400' : charPercent > 75 ? 'bg-yellow-400' : 'bg-[#2B5CE6]'}`}
                    style={{ width: `${charPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hashtags for Instagram */}
          {platform === 'inst' && (
            <div className="mt-4">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Хэштеги</label>
              <textarea
                value={hashtags}
                onChange={e => setHashtags(e.target.value)}
                placeholder="#личныйбренд #маркетинг #apex"
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white/60 text-sm resize-none focus:outline-none focus:border-[#2B5CE6]/30 transition-colors"
                rows={2}
              />
            </div>
          )}

          {/* AI Improve */}
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" onClick={improveWithAI} disabled={aiImproving} className="flex-1">
              <Sparkles size={15} className={aiImproving ? 'animate-spin' : ''} />
              {aiImproving ? 'Улучшаю...' : 'Улучшить через AI'}
            </Button>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          {/* Platform */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Площадка</label>
            <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className={`${selectClass} w-full`}>
              {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Статус</label>
            <select value={status} onChange={e => setStatus(e.target.value as PostStatus)} className={`${selectClass} w-full`}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Pillar */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Контентный столп</label>
            <select value={pillar} onChange={e => setPillar(e.target.value as ContentPillar)} className={`${selectClass} w-full`}>
              {Object.entries(PILLAR_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Запланировать</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className={`${selectClass} w-full`}
            />
          </div>

          {/* Versions */}
          {versions.length > 0 && (
            <div>
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wider w-full"
              >
                <Clock size={12} />
                История версий ({versions.length})
                <ChevronDown size={12} className={`ml-auto transition-transform ${showVersions ? 'rotate-180' : ''}`} />
              </button>
              {showVersions && (
                <div className="mt-2 space-y-2">
                  {versions.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => { if (confirm('Восстановить эту версию?')) setContent(v.content) }}
                      className="w-full text-left p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="text-xs text-white/30 mb-1">Версия {versions.length - i}</div>
                      <div className="text-xs text-white/50 truncate">{v.content.slice(0, 60)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current badges */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
            <Badge className={STATUS_CONFIG[status]?.color}>{STATUS_CONFIG[status]?.label}</Badge>
            <Badge className={PILLAR_CONFIG[pillar]?.color}>{PILLAR_CONFIG[pillar]?.label}</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
