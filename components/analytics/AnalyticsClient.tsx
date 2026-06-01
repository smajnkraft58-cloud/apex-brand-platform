'use client'
import { useState } from 'react'
import { Plus, TrendingUp, Users, Eye, Heart } from 'lucide-react'
import { Analytics, Platform, PLATFORM_CONFIG } from '@/types'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const PILLAR_LABELS: Record<string, string> = { expertise: 'Экспертиза', numbers: 'Цифры', bts: 'BTS', personal: 'Личность' }

export function AnalyticsClient({ data, postStats }: {
  data: Analytics[]
  postStats: { pillar: string; _count: { id: number } }[]
}) {
  const { toast } = useToast()
  const [entries, setEntries] = useState(data)
  const [form, setForm] = useState({ platform: 'tg', date: new Date().toISOString().slice(0, 10), subscribers: '', reach: '', likes: '', posts: '' })
  const [adding, setAdding] = useState(false)

  async function addEntry() {
    const res = await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, subscribers: +form.subscribers, reach: +form.reach, likes: +form.likes, posts: +form.posts }),
    })
    if (res.ok) {
      const entry = await res.json()
      setEntries(prev => [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      setAdding(false)
      toast('Данные сохранены')
    }
  }

  const byPlatform: Record<string, Analytics[]> = {}
  entries.forEach(e => {
    if (!byPlatform[e.platform]) byPlatform[e.platform] = []
    byPlatform[e.platform].push(e)
  })

  const totalSubs = Object.values(byPlatform).reduce((sum, arr) => sum + (arr.at(-1)?.subscribers || 0), 0)
  const totalReach = entries.reduce((s, e) => s + e.reach, 0)

  const inputClass = 'bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors w-full'

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Аналитика</h1>
          <p className="text-white/40 text-sm mt-1">Ручной ввод показателей</p>
        </div>
        <Button onClick={() => setAdding(!adding)}>
          <Plus size={15} />Добавить данные
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Всего подписчиков', value: totalSubs.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Суммарный охват', value: totalReach.toLocaleString(), icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Площадок', value: Object.keys(byPlatform).length, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white/5 border border-white/5 rounded-2xl p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-white/40">{label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-medium text-white/60 mb-4">Новые данные</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} className={inputClass}>
              {Object.entries(PLATFORM_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass} />
            <input type="number" placeholder="Подписчики" value={form.subscribers} onChange={e => setForm(f => ({ ...f, subscribers: e.target.value }))} className={inputClass} />
            <input type="number" placeholder="Охват" value={form.reach} onChange={e => setForm(f => ({ ...f, reach: e.target.value }))} className={inputClass} />
            <input type="number" placeholder="Лайки" value={form.likes} onChange={e => setForm(f => ({ ...f, likes: e.target.value }))} className={inputClass} />
            <input type="number" placeholder="Постов" value={form.posts} onChange={e => setForm(f => ({ ...f, posts: e.target.value }))} className={inputClass} />
          </div>
          <Button onClick={addEntry}>Сохранить</Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* By platform */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">По площадкам</h3>
          {Object.keys(byPlatform).length === 0 ? (
            <div className="text-center py-8 text-white/25 text-sm">Данных пока нет</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(byPlatform).map(([p, arr]) => {
                const latest = arr.at(-1)
                if (!latest) return null
                return (
                  <div key={p} className="flex items-center gap-3">
                    <span className="text-xl">{PLATFORM_CONFIG[p as Platform]?.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm text-white/70">{PLATFORM_CONFIG[p as Platform]?.label}</div>
                      <div className="text-xs text-white/30">{latest.subscribers.toLocaleString()} подписчиков</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/60">{latest.reach.toLocaleString()}</div>
                      <div className="text-xs text-white/30">охват</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* By pillar */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Столпы контента</h3>
          {postStats.length === 0 ? (
            <div className="text-center py-8 text-white/25 text-sm">Постов пока нет</div>
          ) : (
            <div className="space-y-3">
              {postStats.map(({ pillar, _count }) => {
                const total = postStats.reduce((s, p) => s + p._count.id, 0)
                const pct = total ? Math.round((_count.id / total) * 100) : 0
                return (
                  <div key={pillar}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white/70">{PILLAR_LABELS[pillar] || pillar}</span>
                      <span className="text-sm text-white/40">{_count.id} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2B5CE6] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
