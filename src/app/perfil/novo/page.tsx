'use client'

import { createAthlete } from './actions'
import { AthleteForm } from '@/components/atletas/AthleteForm'

export default function NovoAtletaPage() {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-start px-4 py-8 sm:py-12">
      <AthleteForm 
        mode="create" 
        onSubmit={createAthlete} 
      />
    </div>
  )
}
