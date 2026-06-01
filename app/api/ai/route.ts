import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SYSTEM_PROMPT = `Ты — AI-помощник Славы Милованова, CEO агентства APEX.

О Славе:
- CEO и основатель агентства APEX (digital-маркетинг, личный брендинг, контент)
- Эксперт по личному бренду, маркетингу и бизнесу
- Публикует контент в Telegram, Instagram, VK, YouTube Shorts, Threads, VC.ru, Яндекс Дзен
- Стиль: честный, прямой, без воды, с конкретными цифрами и кейсами

Контентные столпы:
1. Экспертиза — профессиональные инсайты, советы, методологии
2. Цифры — конкретные результаты, метрики, кейсы с данными
3. BTS (Behind The Scenes) — жизнь агентства изнутри, рабочие моменты
4. Личность — личные истории, ценности, взгляды на жизнь

Правила написания:
- Начинай с сильного крючка (вопрос, факт, провокация)
- Используй короткие абзацы и списки
- Конкретика > абстракции
- Живой разговорный язык, без канцелярита
- Всегда есть призыв к действию или вопрос для вовлечения

Форматы по площадкам:
- TG: до 4096 символов, можно Markdown (**жирный**, _курсив_)
- INST: до 2200 символов, хэштеги в конце отдельным блоком
- VK: до 16000 символов, развёрнуто
- Shorts: сценарий (Крючок 0-3с / Тело 3-45с / Призыв 45-60с)
- Threads: до 500 символов, коротко и провокационно
- VC/Дзен: лонгрид с заголовками H2, списками, полная экспертиза

Отвечай только на русском языке. Создавай контент под личный бренд Славы.`

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message, chatId, platform, mode } = await req.json()
  if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API ключ не настроен. Добавьте ANTHROPIC_API_KEY в .env' }, { status: 503 })

  let chat = chatId ? await prisma.aiChat.findFirst({ where: { id: chatId, userId: session.userId }, include: { messages: { orderBy: { createdAt: 'asc' } } } }) : null

  if (!chat) {
    chat = await prisma.aiChat.create({ data: { userId: session.userId, title: message.slice(0, 50) }, include: { messages: true } })
  }

  await prisma.aiMessage.create({ data: { chatId: chat.id, role: 'user', content: message } })

  const platformHint = platform ? `\n\nПлощадка: ${platform}` : ''
  const modeHint = mode ? `\nРежим: ${mode}` : ''

  const client = new Anthropic({ apiKey })
  const messages = (chat.messages || []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
  messages.push({ role: 'user', content: message + platformHint + modeHint })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages,
  })

  const assistantContent = response.content[0].type === 'text' ? response.content[0].text : ''
  await prisma.aiMessage.create({ data: { chatId: chat.id, role: 'assistant', content: assistantContent } })

  return NextResponse.json({ reply: assistantContent, chatId: chat.id })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const chats = await prisma.aiChat.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
  return NextResponse.json(chats)
}
