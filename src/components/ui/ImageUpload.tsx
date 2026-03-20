'use client'

import { useState, useRef } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { ImageIcon, Upload, Loader2, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  description?: string
  className?: string
  aspectRatio?: '16/9' | '1/1' | 'auto'
}

export function ImageUpload({ 
  value, 
  onChange, 
  label, 
  description,
  className,
  aspectRatio = '16/9'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createSupabaseBrowser()

  const handleFile = async (file: File) => {
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
       alert('Por favor, envie apenas imagens.')
       return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    try {
      setUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('atletas')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('atletas')
        .getPublicUrl(filePath)

      onChange(publicUrl)
    } catch (error: any) {
      console.error('Error uploading image:', error)
      alert('Erro ao enviar imagem: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setUploading(false)
    }
  }

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const ratioClass = aspectRatio === '16/9' ? 'aspect-video' : aspectRatio === '1/1' ? 'aspect-square' : ''

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest leading-none mb-1.5 block">{label}</label>}
      
      <div 
        className={cn(
          "relative group border border-dashed border-neutral-200 rounded-xl overflow-hidden transition-all duration-300",
          dragActive ? "border-green-400 bg-green-50/50" : "bg-white hover:border-neutral-300 hover:bg-neutral-50/30",
          ratioClass
        )}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {value ? (
          <div className="relative w-full h-full">
            <img 
               src={value} 
               alt="Preview" 
               className="w-full h-full object-cover"
            />
            {/* Overlay to Re-upload */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
               <div className="bg-white/90 p-2 rounded-full text-neutral-900 shadow-lg">
                  <Upload size={20} />
               </div>
            </div>
            {/* Clear Button */}
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors z-10"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 cursor-pointer">
            {uploading ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <Loader2 size={32} className="text-green-500 animate-spin mb-2" />
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Enviando...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-neutral-400 group-hover:text-neutral-500 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-3 group-hover:bg-green-50 group-hover:text-green-500 transition-all shadow-sm">
                   <ImageIcon size={24} />
                </div>
                <p className="text-xs font-medium mb-1">Escolha ou arraste uma foto</p>
                <p className="text-[10px] text-neutral-400">JPG, PNG ou WEBP até 5MB</p>
              </div>
            )}
          </div>
        )}
      </div>
      {description && <p className="text-[10px] text-neutral-400 mt-1">{description}</p>}
    </div>
  )
}
