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

  const [imgError, setImgError] = useState<Record<number, boolean>>({})

  const items: MediaItem[] = [
    ...photos.filter(Boolean).map(url => ({ type: 'image' as const, url })),
    ...videos.filter(v => v.url).map(v => ({ 
      type: 'video' as const, 
      url: v.url 
    }))
  ]

  // Filter out items with errors
  const validItems = items.filter((_, i) => !imgError[i])

  if (validItems.length === 0) {
    return null
  }

  const activeItem = validItems[activeIndex] || validItems[0]
  const youtubeId = activeItem.type === 'video' ? getYoutubeId(activeItem.url) : null
  const isVerticalVideo = activeItem.type === 'video' && activeItem.url.includes('shorts')

  return (
    <div className="flex flex-col gap-4">
      {/* Main View */}
      <div className={cn(
        "relative bg-black rounded-3xl overflow-hidden shadow-2xl group border border-white/10 transition-all duration-500 ease-in-out",
        activeItem.type === 'video' 
          ? (isVerticalVideo ? "aspect-[9/16] max-h-[600px] mx-auto" : "aspect-video") 
          : "min-h-[250px] aspect-auto"
      )}>
        {activeItem.type === 'image' ? (
          <div className="w-full relative border-0 flex items-center justify-center bg-black min-h-[inherit]">
            {/* Vibrant Blurred Background - Robustly Filling any screen size */}
            <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
               <img 
                 src={activeItem.url} 
                 alt="" 
                 className="absolute inset-[-10%] w-[120%] h-[120%] object-cover blur-3xl opacity-70 scale-125"
               />
            </div>
            {/* Main Image - Full Detail */}
            <img 
              src={activeItem.url} 
              alt="Atleta" 
              className="relative max-w-full max-h-[600px] object-contain animate-in fade-in zoom-in-95 duration-500 z-10"
              onError={() => setImgError(prev => ({ ...prev, [activeIndex]: true }))}
            />
          </div>
        ) : youtubeId ? (
          <div className="w-full h-full">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&modestbranding=1&rel=0`}
              title="Video highlight"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/40 p-8 text-center bg-neutral-900 aspect-video">
            <Video size={48} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-sm font-display uppercase tracking-widest">Mídia indisponível</p>
          </div>
        )}

        {/* Overlay Gradients */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20" />

        {/* Navigation Arrows */}
        {validItems.length > 1 && (
          <>
            <button 
              onClick={() => setActiveIndex(prev => (prev === 0 ? validItems.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/25 hover:scale-110 border border-white/20 active:scale-95 z-30"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setActiveIndex(prev => (prev === validItems.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/25 hover:scale-110 border border-white/20 active:scale-95 z-30"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/90 tracking-widest uppercase z-30">
          {activeIndex + 1} / {validItems.length}
        </div>
      </div>

      {/* Thumbnails */}
      {validItems.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide snap-x">
          {validItems.map((item, i) => {
            const yId = item.type === 'video' ? getYoutubeId(item.url) : null
            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative w-24 h-16 sm:w-32 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all snap-start",
                  activeIndex === i 
                    ? "border-green-500 ring-4 ring-green-500/20 scale-105 z-10" 
                    : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"
                )}
              >
                {item.type === 'image' ? (
                  <img src={item.url} alt="Miniatura" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white relative">
                    {yId ? (
                      <img 
                        src={`https://img.youtube.com/vi/${yId}/mqdefault.jpg`} 
                        alt="YouTube"
                        className="w-full h-full object-cover opacity-60"
                      />
                    ) : <Video size={16} />}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play size={20} fill="white" className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
