'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Post, PLATFORM_CONFIG, PILLAR_CONFIG } from '@/types'
import { Button } from '@/components/ui/Button'

type ViewMode = 'month' | 'week'

const PILLAR_DOT_COLORS = { expertise: 'bg-blue-400', numbers: 'bg-yellow-400', bts: 'bg-pink-400', personal: 'bg-purple-400' }

export function CalendarClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [view, setView] = useState<ViewMode>('month')
  const [current, setCurrent] = useState(new Date())

  const year = current.getFullYear()
  const month = current.getMonth()

  const postsByDay = useMemo(() => {
    const map: Record<string, Post[]> = {}
    posts.forEach(p => {
      if (!p.scheduledAt) return
      const key = p.scheduledAt.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(p)
    })
    return map
  }, [posts])

  function getDaysInMonth() {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []
    const startDow = (firstDay.getDay() + 6) % 7
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
    return days
  }

  function getWeekDays() {
    const start = new Date(current)
    const dow = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - dow)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })
  }

  function navigate(dir: number) {
    const d = new Date(current)
    if (view === 'month') d.setMonth(d.getMonth() + dir)
    else d.setDate(d.getDate() + dir * 7)
    setCurrent(d)
  }

  const weekDayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  function DayCell({ date }: { date: Date | null }) {
    if (!date) return <div className="min-h-24 bg-white/2 rounded-xl" />
    const key = date.toISOString().slice(0, 10)
    const dayPosts = postsByDay[key] || []
    const isToday = key === new Date().toISOString().slice(0, 10)
    return (
      <div className={`min-h-24 p-2 rounded-xl border transition-colors ${isToday ? 'border-[#2B5CE6]/40 bg-[#2B5CE6]/5' : 'border-white/5 hover:border-white/10'}`}>
        <div className={`text-xs font-medium mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#2B5CE6] text-white' : 'text-white/40'}`}>
          {date.getDate()}
        </div>
        <div className="space-y-1">
          {dayPosts.slice(0, 3).map(post => (
            <Link key={post.id} href={`/posts/${post.id}`}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PILLAR_DOT_COLORS[post.pillar]}`} />
              <span className="text-xs text-white/60 truncate group-hover:text-white/80 transition-colors">
                {PLATFORM_CONFIG[post.platform]?.icon} {post.title || post.content.slice(0, 20)}
              </span>
            </Link>
          ))}
          {dayPosts.length > 3 && <div className="text-xs text-white/30 px-2">+{dayPosts.length - 3} ещё</div>}
        </div>
      </div>
    )
  }

  const monthName = current.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Контент-план</h1>
          <p className="text-white/40 text-sm mt-1 capitalize">{monthName}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {(['month', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${view === v ? 'bg-white/10 text-white' : 'text-white/40'}`}>
                {v === 'month' ? 'Месяц' : 'Неделя'}
              </button>
            ))}
          </div>
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
          <button onClick={() => setCurrent(new Date())} className="px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors">Сегодня</button>
          <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"><ChevronRight size={18} /></button>
          <Link href="/posts/new"><Button><Plus size={15} />Новый пост</Button></Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        {Object.entries(PILLAR_DOT_COLORS).map(([pillar, color]) => (
          <div key={pillar} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-white/40 capitalize">{pillar === 'expertise' ? 'Экспертиза' : pillar === 'numbers' ? 'Цифры' : pillar === 'bts' ? 'BTS' : 'Личность'}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDayNames.map(d => <div key={d} className="text-xs text-white/30 text-center py-1">{d}</div>)}
        </div>
        {view === 'month' ? (
          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth().map((date, i) => <DayCell key={i} date={date} />)}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {getWeekDays().map((date, i) => <DayCell key={i} date={date} />)}
          </div>
        )}
      </div>
    </div>
  )
}
