'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Image, Calendar, Bot, BarChart3, CheckSquare, LogOut, Zap, BookTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { href: '/posts', icon: FileText, label: 'Контент-хаб' },
  { href: '/posts/new', icon: Zap, label: 'Новый пост' },
  { href: '/calendar', icon: Calendar, label: 'Контент-план' },
  { href: '/ai', icon: Bot, label: 'AI-ассистент' },
  { href: '/media', icon: Image, label: 'Медиатека' },
  { href: '/analytics', icon: BarChart3, label: 'Аналитика' },
  { href: '/tasks', icon: CheckSquare, label: 'Задачи' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#0D0D14] border-r border-white/5 flex flex-col z-30">
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2B5CE6] flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">APEX</div>
            <div className="text-xs text-white/40">Brand Platform</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && href !== '/posts/new' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                active
                  ? 'bg-[#2B5CE6]/20 text-[#5B8AF8] font-medium'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={17} />
          Выйти
        </button>
      </div>
    </aside>
  )
}
