import { cn, getInitials } from '@/lib/utils'

// -----------------------------------------------
// Badge
// -----------------------------------------------
type BadgeVariant = 'green' | 'amber' | 'blue' | 'red' | 'gray' | 'outline'

function Badge({
  children,
  variant = 'gray',
  className,
}: {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  const variants: Record<BadgeVariant, string> = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-neutral-200 text-neutral-600',
    outline: 'border border-neutral-200 text-neutral-600 bg-transparent',
  }
  return (
    <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// -----------------------------------------------
// Card
// -----------------------------------------------
function Card({ children, className, hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={cn(
      'bg-white border border-neutral-200 rounded-xl',
      hover && 'transition-all duration-150 hover:-translate-y-1 hover:shadow-md cursor-pointer',
      className
    )}>
      {children}
    </div>
  )
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-5 border-b border-neutral-100', className)}>{children}</div>
}

function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-3 border-t border-neutral-100 flex items-center justify-between', className)}>{children}</div>
}

// -----------------------------------------------
// Skeleton loader
// -----------------------------------------------
function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-neutral-200', className)} />
}

// -----------------------------------------------
// Avatar
// -----------------------------------------------
type AvatarColor = 'green' | 'amber' | 'blue' | 'red' | 'purple'

const avatarColors: Record<AvatarColor, string> = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-700',
}

function Avatar({
  name,
  src,
  size = 'md',
  color = 'green',
  className,
}: {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: AvatarColor
  className?: string
}) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' }

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center font-display flex-shrink-0', sizes[size], avatarColors[color], className)}>
      {getInitials(name)}
    </div>
  )
}

// -----------------------------------------------
// Divider
// -----------------------------------------------
function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-neutral-200 my-4" />
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-neutral-200" />
      <span className="text-xs text-neutral-400">{label}</span>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  )
}

// -----------------------------------------------
// Toggle (Switch)
// -----------------------------------------------
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2',
          checked ? 'bg-green-400' : 'bg-neutral-300'
        )}
      >
        <span className={cn(
          'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
          checked ? 'left-5' : 'left-1'
        )} />
      </button>
    </div>
  )
}

// -----------------------------------------------
// SkillBar
// -----------------------------------------------
function SkillBar({ label, value, color = 'green' }: { label: string; value: number; color?: 'green' | 'amber' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-500 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color === 'green' ? 'bg-green-400' : 'bg-amber-500')}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium text-neutral-700 w-6 text-right">{value}</span>
    </div>
  )
}

export { Badge, Card, CardHeader, CardBody, CardFooter, Skeleton, Avatar, Divider, Toggle, SkillBar }
