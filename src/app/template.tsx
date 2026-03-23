'use client'

import { ReactNode } from 'react'

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="animate-fade-in sm:animate-fade-up duration-500">
      {children}
    </div>
  )
}
