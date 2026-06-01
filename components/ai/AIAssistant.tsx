'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Bot, User, Copy, FileText, Sparkles, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Platform, PLATFORM_CONFIG } from '@/types'

interface Message { role: 'user' | 'assistant'; content: string }

const QUICK_PROMPTS = [
  { label: 'Пост про кейс', prompt: 'Напиши пост-кейс про успешный проект APEX с конкретными цифрами результатов' },
  { label: 'Утренний тезис', prompt: 'Напиши короткий утренний тезис про бизнес, маркетинг или личный бренд — что-то мотивирующее и конкретное' },
  { label: 'BTS агентства', prompt: 'Напиши пост про закулисье работы APEX — что происходит в агентстве, как работает команда' },
  { label: 'Цифра дня', prompt: 'Придумай интересную цифру или статистику про маркетинг или личный бренд и напиши короткий пост' },
  { label: 'Экспертный совет', prompt: 'Напиши экспертный пост с 3 конкретными советами по продвижению личного бренда' },
]

const MODES = [
  { value: 'write', label: 'Написать пост' },
  { value: 'improve', label: 'Улучшить текст' },
  { value: 'adapt', label: 'Адаптировать' },
  { value: 'ideas', label: 'Генерация идей' },
]

export function AIAssistant() {
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [platform, setPlatform] = useState<Platform>('tg')
  const [mode, setMode] = useState('write')
  const [chatId, setChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const msg = text || input
    if (!msg.trim() || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, chatId, platform, mode }),
    })

    if (res.ok) {
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      setChatId(data.chatId)
    } else {
      const err = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err.error || 'Ошибка запроса'}` }])
    }
    setLoading(false)
  }

  async function saveToDraft(content: string) {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, platform, status: 'draft' }),
    })
    if (res.ok) {
      const post = await res.json()
      toast('Сохранено в черновики')
      router.push(`/posts/${post.id}`)
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text)
    toast('Скопировано')
  }

  function newChat() {
    setMessages([])
    setChatId(null)
  }

  const selectClass = 'bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none transition-colors'

  return (
    <div className="flex flex-col h-screen p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI-ассистент</h1>
          <p className="text-white/40 text-sm mt-1">Создаёт контент в стиле Славы Милованова</p>
        </div>
        <Button variant="secondary" onClick={newChat}>
          <Plus size={15} />Новый чат
        </Button>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4">
        <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className={selectClass}>
          {Object.entries(PLATFORM_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select value={mode} onChange={e => setMode(e.target.value)} className={selectClass}>
          {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {QUICK_PROMPTS.map(q => (
          <button
            key={q.label}
            onClick={() => send(q.prompt)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white hover:border-[#2B5CE6]/40 transition-all"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-[#2B5CE6]/20 rounded-2xl flex items-center justify-center mb-4">
              <Bot size={32} className="text-[#5B8AF8]" />
            </div>
            <h3 className="text-white/60 font-medium mb-2">AI знает всё о бренде Славы</h3>
            <p className="text-white/30 text-sm max-w-sm">Выберите площадку, режим и задайте вопрос или используйте быстрые промпты</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-[#2B5CE6]/20 rounded-lg flex-shrink-0 flex items-center justify-center mt-1">
                <Bot size={14} className="text-[#5B8AF8]" />
              </div>
            )}
            <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-[#2B5CE6]/20 rounded-2xl rounded-tr-sm' : 'bg-white/5 rounded-2xl rounded-tl-sm'} px-4 py-3`}>
              <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.role === 'assistant' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                  <button onClick={() => copyText(msg.content)} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                    <Copy size={12} />Копировать
                  </button>
                  <button onClick={() => saveToDraft(msg.content)} className="flex items-center gap-1 text-xs text-white/30 hover:text-[#5B8AF8] transition-colors">
                    <FileText size={12} />Сохранить в черновик
                  </button>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-white/10 rounded-lg flex-shrink-0 flex items-center justify-center mt-1">
                <User size={14} className="text-white/60" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-[#2B5CE6]/20 rounded-lg flex-shrink-0 flex items-center justify-center">
              <Sparkles size={14} className="text-[#5B8AF8] animate-pulse" />
            </div>
            <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 bg-white/5 border border-white/10 rounded-2xl p-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Напишите запрос... (Enter — отправить, Shift+Enter — новая строка)"
          className="flex-1 bg-transparent text-white/80 text-sm resize-none focus:outline-none placeholder-white/25 px-2 py-1 max-h-32"
          rows={2}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="self-end p-3 bg-[#2B5CE6] hover:bg-[#2451CC] disabled:opacity-30 rounded-xl transition-all"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
