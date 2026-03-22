'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'

interface AvatarProps {
    src?: string | null
    nome: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    className?: string
    colorClass?: string
}

const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
}

function getInitials(nome: string) {
    const parts = nome.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return nome.slice(0, 2).toUpperCase()
}

export function Avatar({ src, nome, size = 'md', className, colorClass }: AvatarProps) {
    const [imgError, setImgError] = useState(false)

    const sizeClass = sizeMap[size]
    const defaultColor = colorClass ?? 'bg-green-100 text-green-700'

    const validSrc = src && src !== 'null' && src !== 'undefined' && src !== '' && !imgError
        ? src
        : null

    if (validSrc) {
        return (
            <div className={cn('rounded-full overflow-hidden flex-shrink-0 bg-neutral-100', sizeClass, className)}>
                <img
                    src={validSrc}
                    alt={nome}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            </div>
        )
    }

    return (
        <div className={cn(
            'rounded-full flex items-center justify-center font-display flex-shrink-0 select-none',
            sizeClass,
            defaultColor,
            className
        )}>
            {getInitials(nome)}
        </div>
    )
}