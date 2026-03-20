'use client'

import { useState } from 'react'
import { Play, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaItem {
  type: 'image' | 'video'
  url: string
  thumbnail?: string
}

interface MediaGalleryProps {
  photos: string[]
  videos: { url: string; titulo: string }[]
}

export function MediaGallery({ photos, videos }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Extract YouTube ID
  function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const items: MediaItem[] = [
    ...photos.filter(Boolean).map(url => ({ type: 'image' as const, url })),
    ...videos.filter(v => v.url).map(v => ({ 
      type: 'video' as const, 
      url: v.url 
    }))
  ]

  if (items.length === 0) {
    return (
      <div className="aspect-[4/3] sm:aspect-video bg-neutral-100 rounded-2xl flex flex-col items-center justify-center text-neutral-300 border border-neutral-200 border-dashed">
        <ImageIcon size={48} strokeWidth={1} />
        <p className="text-xs mt-2 font-medium">Nenhuma mídia disponível</p>
      </div>
    )
  }

  const activeItem = items[activeIndex]
  const youtubeId = activeItem.type === 'video' ? getYoutubeId(activeItem.url) : null

  return (
    <div className="flex flex-col gap-3">
      {/* Main View */}
      <div className="relative aspect-[4/3] sm:aspect-video bg-black rounded-2xl overflow-hidden shadow-lg group">
        {activeItem.type === 'image' ? (
          <img 
            src={activeItem.url} 
            alt="Atleta" 
            className="w-full h-full object-cover"
          />
        ) : youtubeId ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0`}
            title="Video highlight"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white p-8 text-center bg-neutral-900 border border-white/10">
            <p className="text-xs font-medium">Vídeo não pode ser carregado.<br/>Verifique o link do YouTube.</p>
          </div>
        )}

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button 
              onClick={() => setActiveIndex(prev => (prev === 0 ? items.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setActiveIndex(prev => (prev === items.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                activeIndex === i ? "border-green-500 ring-2 ring-green-100" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              {item.type === 'image' ? (
                <img src={item.url} alt="Miniatura" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white relative">
                  {getYoutubeId(item.url) ? (
                    <img 
                      src={`https://img.youtube.com/vi/${getYoutubeId(item.url)}/default.jpg`} 
                      alt="YouTube"
                      className="w-full h-full object-cover opacity-50"
                    />
                  ) : <Video size={16} />}
                  <Play size={16} className="absolute text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
