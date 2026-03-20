'use client'
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'outline' | 'amber' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer'

    const variants = {
      primary: 'bg-green-400 hover:bg-green-600 text-white focus-visible:ring-green-400',
      dark:    'bg-green-700 hover:bg-green-800 text-white focus-visible:ring-green-700',
      outline: 'bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-900 focus-visible:ring-neutral-300',
      amber:   'bg-amber-500 hover:bg-amber-600 text-white focus-visible:ring-amber-500',
      ghost:   'bg-transparent hover:bg-neutral-200 text-neutral-700 focus-visible:ring-neutral-300',
      danger:  'bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
