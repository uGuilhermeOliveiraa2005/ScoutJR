'use client'
import { cn } from '@/lib/utils'
import { forwardRef, useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type LabelHTMLAttributes } from 'react'
import { Eye, EyeOff, ChevronDown } from 'lucide-react'

// -----------------------------------------------
// Input
// -----------------------------------------------
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="w-full">
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10 transition-colors group-focus-within:text-green-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={cn(
              'w-full px-4 py-3.5 text-[15px] border-2 rounded-xl bg-neutral-50/50 text-neutral-900 font-medium outline-none transition-all placeholder:text-neutral-400 placeholder:font-normal shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]',
              'focus:bg-white focus:border-green-500 focus:ring-[4px] focus:ring-green-500/15',
              error 
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15 bg-red-50/30' 
                : 'border-neutral-200/80 hover:border-neutral-300',
              leftIcon && 'pl-11',
              isPassword && 'pr-12',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onMouseDown={e => {
                e.preventDefault()
              }}
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors z-20"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-bold animate-fade-in pl-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// -----------------------------------------------
// Textarea
// -----------------------------------------------
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3.5 text-[15px] border-2 rounded-xl bg-neutral-50/50 text-neutral-900 font-medium outline-none transition-all placeholder:text-neutral-400 placeholder:font-normal resize-y min-h-[120px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]',
          'focus:bg-white focus:border-green-500 focus:ring-[4px] focus:ring-green-500/15',
          error 
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15 bg-red-50/30' 
            : 'border-neutral-200/80 hover:border-neutral-300',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-bold pl-1">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// -----------------------------------------------
// Select
// -----------------------------------------------
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => (
    <div className="w-full">
      <div className="relative group">
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3.5 text-[15px] border-2 rounded-xl bg-neutral-50/50 text-neutral-900 font-medium outline-none transition-all appearance-none cursor-pointer pr-12 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]',
            'focus:bg-white focus:border-green-500 focus:ring-[4px] focus:ring-green-500/15',
            error 
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15 bg-red-50/30' 
              : 'border-neutral-200/80 hover:border-neutral-300',
            className
          )}
          {...props}
        >
          {placeholder && <option value="" className="text-neutral-400">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value} className="text-neutral-900 font-medium">{o.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none group-focus-within:text-green-500 transition-colors">
          <ChevronDown size={18} strokeWidth={2.5} />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-bold animate-fade-in pl-1">
          {error}
        </p>
      )}
    </div>
  )
)
Select.displayName = 'Select'

// -----------------------------------------------
// Label
// -----------------------------------------------
const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-[11px] font-black text-neutral-500 uppercase tracking-widest mb-2 px-1', className)}
      {...props}
    />
  )
)
Label.displayName = 'Label'

// -----------------------------------------------
// FieldGroup
// -----------------------------------------------
function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-1.5', className)}>{children}</div>
}

export { Input, Textarea, Select, Label, FieldGroup }