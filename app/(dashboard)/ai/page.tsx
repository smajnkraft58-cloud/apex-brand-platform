import { Bot, Sparkles, Zap, Clock } from 'lucide-react'

export default function AIPage() {
  return (
    <div className="p-8 flex items-center justify-center min-h-[80vh]">
      <div className="max-w-lg text-center">
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="w-24 h-24 bg-[#2B5CE6]/20 rounded-3xl flex items-center justify-center">
            <Bot size={44} className="text-[#5B8AF8]" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-500/20 border border-yellow-500/30 rounded-full flex items-center justify-center">
            <Clock size={14} className="text-yellow-400" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-6">
          <Sparkles size={13} className="text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">В разработке</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">AI-ассистент</h1>
        <p className="text-white/50 text-base leading-relaxed mb-8">
          Умный помощник для создания контента в стиле личного бренда.
          Будет генерировать посты для всех 7 площадок, адаптировать тексты и предлагать идеи.
        </p>

        {/* Features preview */}
        <div className="grid grid-cols-2 gap-3 text-left mb-8">
          {[
            { icon: '✍️', title: 'Написать пост', desc: 'Генерация с учётом площадки и стиля' },
            { icon: '✨', title: 'Улучшить текст', desc: 'Редактура и усиление крючков' },
            { icon: '🔄', title: 'Адаптировать', desc: 'Один пост → 7 форматов' },
            { icon: '💡', title: 'Идеи', desc: 'Темы и форматы на неделю вперёд' },
          ].map(f => (
            <div key={f.title} className="bg-white/5 border border-white/5 rounded-xl p-3">
              <div className="text-lg mb-1">{f.icon}</div>
              <div className="text-sm font-medium text-white/70">{f.title}</div>
              <div className="text-xs text-white/30 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-white/25 text-sm">
          <Zap size={13} />
          <span>Powered by Claude Sonnet — скоро будет доступно</span>
        </div>
      </div>
    </div>
  )
}
