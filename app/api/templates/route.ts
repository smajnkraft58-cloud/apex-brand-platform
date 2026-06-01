import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_TEMPLATES = [
  {
    title: 'Экспертный пост',
    description: 'Делюсь экспертизой с аудиторией',
    platform: 'tg',
    type: 'expert',
    isDefault: true,
    content: `**[Заголовок — главная мысль поста]**

[Крючок — почему это важно / что меня удивило]

Вот что я понял:

1️⃣ [Первый инсайт с объяснением]

2️⃣ [Второй инсайт с объяснением]

3️⃣ [Третий инсайт с объяснением]

[Вывод — практическое применение]

А вы сталкивались с [тема]? Поделитесь в комментариях 👇`,
  },
  {
    title: 'Кейс с цифрами',
    description: 'Описание реального результата клиента',
    platform: 'tg',
    type: 'case',
    isDefault: true,
    content: `**Кейс: [Название / Тема]**

📊 Исходные данные:
— Клиент: [описание без имени]
— Задача: [что нужно было сделать]
— Стартовые показатели: [цифры]

🔧 Что сделали:
1. [Шаг первый]
2. [Шаг второй]
3. [Шаг третий]

✅ Результат за [период]:
— [Метрика 1]: [было] → [стало]
— [Метрика 2]: [было] → [стало]
— ROI: [X]%

💡 Главный вывод: [одно предложение]

Хотите так же? Пишите в личку 👇`,
  },
  {
    title: 'BTS — за кулисами',
    description: 'Жизнь агентства изнутри',
    platform: 'inst',
    type: 'bts',
    isDefault: true,
    content: `[Описание момента — что происходит сейчас]

Обычно это не показывают, но я решил быть честным:

[Реальная ситуация / сложность / рабочий момент]

[Что это значит для команды / клиентов / результата]

Работа в [сфере] — это не только красивые презентации. Это ещё и [реальность].

Подписывайтесь — показываю всё как есть 🎬`,
  },
  {
    title: 'Личный пост',
    description: 'Личная история или взгляды',
    platform: 'tg',
    type: 'personal',
    isDefault: true,
    content: `[Личная история — начало, которое цепляет]

Раньше я думал, что [убеждение].

Но [событие / момент] изменил мой взгляд.

Теперь я понимаю: [новое убеждение / вывод]

Это повлияло на [что именно изменилось в жизни/работе].

Что вас изменило больше всего? 👇`,
  },
  {
    title: 'Цифра дня',
    description: 'Интересная статистика или факт',
    platform: 'threads',
    type: 'numbers',
    isDefault: true,
    content: `[Цифра] — вот [что это значит]

Это [контекст / сравнение].

Вывод: [практическое применение]`,
  },
]

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userTemplates = await prisma.template.findMany({
    where: { OR: [{ userId: session.userId }, { isDefault: true, userId: null }] },
    orderBy: { createdAt: 'desc' },
  })

  if (userTemplates.filter(t => t.isDefault).length === 0) {
    await prisma.template.createMany({ data: DEFAULT_TEMPLATES })
    return NextResponse.json(await prisma.template.findMany({
      where: { OR: [{ userId: session.userId }, { isDefault: true }] },
      orderBy: { createdAt: 'desc' },
    }))
  }

  return NextResponse.json(userTemplates)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const template = await prisma.template.create({
    data: { userId: session.userId, title: data.title, description: data.description || '', content: data.content, platform: data.platform || 'tg', type: data.type || 'expert', isDefault: false },
  })
  return NextResponse.json(template)
}
