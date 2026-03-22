import { createSupabaseBrowser } from '@/lib/supabase'

export async function uploadImage(file: File | null | undefined, folder: string = 'geral'): Promise<string | null> {
  if (!file) return null
  
  const supabase = createSupabaseBrowser()
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage.from('media').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  })

  if (error) {
    console.error('Erro ao fazer upload da imagem:', error)
    throw new Error('Falha no upload da imagem')
  }

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
  return urlData.publicUrl
}

export async function uploadImages(files: (File | string | null | undefined)[], folder: string = 'geral'): Promise<string[]> {
  const validFiles = files.filter(f => f) as (File | string)[]
  
  const urls = await Promise.all(validFiles.map(async f => {
    if (typeof f === 'string') return f; // Se já for URL, mantém
    return await uploadImage(f as File, folder)
  }))

  return urls.filter(Boolean) as string[]
}
