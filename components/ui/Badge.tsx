import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', className)}>
      {children}
    </span>
  )
}
