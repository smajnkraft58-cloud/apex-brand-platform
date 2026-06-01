'use client'
import { useState } from 'react'
import { Plus, Trash2, CheckSquare, Square, Calendar, AlertCircle, Lightbulb, Star } from 'lucide-react'
import { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'

const TAG_CONFIG = {
  urgent: { label: 'Срочно', icon: AlertCircle, color: 'bg-red-500/20 text-red-400' },
  important: { label: 'Важно', icon: Star, color: 'bg-yellow-500/20 text-yellow-400' },
  idea: { label: 'Идея', icon: Lightbulb, color: 'bg-purple-500/20 text-purple-400' },
  '': { label: '', icon: null, color: '' },
}

export function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const { toast } = useToast()
  const [tasks, setTasks] = useState(initialTasks)
  const [newTitle, setNewTitle] = useState('')
  const [newTag, setNewTag] = useState<'' | 'urgent' | 'important' | 'idea'>('')
  const [newDeadline, setNewDeadline] = useState('')

  async function addTask() {
    if (!newTitle.trim()) return
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, tag: newTag, deadline: newDeadline || null }),
    })
    if (res.ok) {
      const task = await res.json()
      setTasks(prev => [task, ...prev])
      setNewTitle('')
      setNewTag('')
      setNewDeadline('')
      toast('Задача добавлена')
    }
  }

  async function toggleTask(id: string, done: boolean) {
    await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: !done }) })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t))
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
    toast('Задача удалена')
  }

  const active = tasks.filter(t => !t.done)
  const done = tasks.filter(t => t.done)

  const inputClass = 'bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-[#2B5CE6]/50 transition-colors'

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Задачи</h1>
          <p className="text-white/40 text-sm mt-1">{active.length} активных</p>
        </div>
      </div>

      {/* Add task */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-6">
        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Новая задача</h2>
        <div className="flex gap-3 mb-3">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Что нужно сделать?"
            className={`${inputClass} flex-1`}
          />
          <Button onClick={addTask} disabled={!newTitle.trim()}>
            <Plus size={15} />
            Добавить
          </Button>
        </div>
        <div className="flex gap-3">
          <select value={newTag} onChange={e => setNewTag(e.target.value as '' | 'urgent' | 'important' | 'idea')} className={inputClass}>
            <option value="">Без тега</option>
            <option value="urgent">Срочно</option>
            <option value="important">Важно</option>
            <option value="idea">Идея</option>
          </select>
          <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Active tasks */}
      <div className="space-y-2 mb-6">
        {active.length === 0 ? (
          <div className="text-center py-12 text-white/20">
            <CheckSquare size={40} className="mx-auto mb-2 opacity-30" />
            <p>Нет активных задач</p>
          </div>
        ) : (
          active.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
              <button onClick={() => toggleTask(task.id, task.done)} className="text-white/30 hover:text-[#5B8AF8] transition-colors flex-shrink-0">
                <Square size={18} />
              </button>
              <div className="flex-1">
                <span className="text-sm text-white/80">{task.title}</span>
                {task.deadline && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar size={11} className="text-white/30" />
                    <span className="text-xs text-white/30">{formatDate(task.deadline)}</span>
                  </div>
                )}
              </div>
              {task.tag && task.tag in TAG_CONFIG && (task.tag as string) !== '' && (
                <Badge className={TAG_CONFIG[task.tag as 'urgent' | 'important' | 'idea'].color}>
                  {TAG_CONFIG[task.tag as 'urgent' | 'important' | 'idea'].label}
                </Badge>
              )}
              <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div>
          <h3 className="text-xs text-white/30 uppercase tracking-wider mb-2">Выполнено ({done.length})</h3>
          <div className="space-y-2">
            {done.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-4 bg-white/3 border border-white/3 rounded-2xl group">
                <button onClick={() => toggleTask(task.id, task.done)} className="text-emerald-500/60 flex-shrink-0">
                  <CheckSquare size={18} />
                </button>
                <span className="text-sm text-white/30 line-through flex-1">{task.title}</span>
                <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
