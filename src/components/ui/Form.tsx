'use client'
import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type LabelHTMLAttributes } from 'react'

// -----------------------------------------------
// Input
// -----------------------------------------------
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, ...props }, ref) => (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-neutral-900 outline-none transition-colors placeholder:text-neutral-400',
          'focus:border-green-400 focus:ring-2 focus:ring-green-100',
          error ? 'border-red-400 ring-2 ring-red-100' : 'border-neutral-200',
          leftIcon && 'pl-9',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
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
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-neutral-900 outline-none transition-colors appearance-none cursor-pointer',
          'focus:border-green-400 focus:ring-2 focus:ring-green-100',
          error ? 'border-red-400 ring-2 ring-red-100' : 'border-neutral-200',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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
