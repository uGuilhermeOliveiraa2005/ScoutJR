// ============================================
// ScoutJR — Proxy (antigo middleware)
// Proteção de rotas + refresh de sessão + headers
// Next.js 16+ usa proxy.ts em vez de middleware.ts
// ============================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/perfil', '/busca', '/configuracoes', '/admin']
const AUTH_ROUTES = ['/login', '/cadastro', '/recuperar-senha']
const ADMIN_ROUTES = ['/admin']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute  = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected && !user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user && !request.nextUrl.searchParams.has('error')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('user_id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Security headers
  const h = supabaseResponse.headers
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('X-Frame-Options', 'DENY')
  h.set('X-XSS-Protection', '1; mode=block')
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
