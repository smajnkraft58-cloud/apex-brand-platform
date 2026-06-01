'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password } : { email, password, name }
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Ошибка'); setLoading(false); return }
    router.push('/dashboard')
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#2B5CE6]/60 transition-colors text-sm'

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2B5CE6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#2B5CE6] rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/30">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">APEX</h1>
          <p className="text-white/40 text-sm mt-1">Brand Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-7 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white mb-1">
            {mode === 'login' ? 'Войти в платформу' : 'Создать аккаунт'}
          </h2>
          <p className="text-white/40 text-sm mb-6">
            {mode === 'login' ? 'Введите email и пароль' : 'Заполните данные для регистрации'}
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={15} className="text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" className={inputClass} />
            )}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className={inputClass} />
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" required className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2" size="lg">
              {loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </form>

          <p className="text-center text-sm text-white/30 mt-4">
            {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-[#5B8AF8] hover:underline">
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
