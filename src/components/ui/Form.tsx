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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={cn(
              'w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-neutral-900 outline-none transition-all placeholder:text-neutral-400 font-sans',
              'focus:border-green-400 focus:ring-2 focus:ring-green-100',
              error ? 'border-red-400 ring-2 ring-red-100 bg-red-50/10' : 'border-neutral-200 hover:border-neutral-300',
              leftIcon && 'pl-9',
              isPassword && 'pr-10',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onMouseDown={e => {
                // Impede que o input perca foco ao clicar no botão
                e.preventDefault()
              }}
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors z-20"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-[10px] sm:text-xs text-red-500 font-medium animate-fade-in pl-1">
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
          'w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 resize-y min-h-[100px]',
          'focus:border-green-400 focus:ring-2 focus:ring-green-100',
          error ? 'border-red-400 ring-2 ring-red-100' : 'border-neutral-200',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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
            'w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-neutral-900 outline-none transition-all appearance-none cursor-pointer pr-10 font-sans',
            'focus:border-green-400 focus:ring-2 focus:ring-green-100',
            error ? 'border-red-400 ring-2 ring-red-100 bg-red-50/10' : 'border-neutral-200 hover:border-neutral-300',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none group-hover:text-neutral-600 transition-colors">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-[10px] sm:text-xs text-red-500 font-medium animate-fade-in pl-1">
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
      className={cn('block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5', className)}
      {...props}
    />
  )
)
Label.displayName = 'Label'

// -----------------------------------------------
// FieldGroup
// -----------------------------------------------
function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-1', className)}>{children}</div>
}

export { Input, Textarea, Select, Label, FieldGroup }