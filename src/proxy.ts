// ============================================
// ScoutJR — Proxy (Next.js 16+)
// CAMINHO: src/proxy.ts
// ============================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/perfil', '/busca', '/configuracoes', '/admin', '/checkout']
const AUTH_ROUTES = ['/login', '/cadastro', '/recuperar-senha']
const ADMIN_ROUTES = ['/admin']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
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
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected && !user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user && !request.nextUrl.searchParams.has('error')) {
    const isGoogleSignup = pathname === '/cadastro' && request.nextUrl.searchParams.get('method') === 'google'

    if (!isGoogleSignup) {
      const { data: mfaLevel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      const needsMfa = mfaLevel?.currentLevel !== 'aal2' && mfaLevel?.nextLevel === 'aal2'

      if (!needsMfa) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  if (isProtected && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, is_admin, telefone')
      .eq('user_id', user.id)
      .single()

    // Só redireciona para completar cadastro se:
    // 1. Não tem telefone
    // 2. O usuário fez login com Google (provider = google)
    // 3. Não é uma conta existente com role já definida
    const isGoogleUser = user.app_metadata?.provider === 'google'
    const isNewGoogleUser = isGoogleUser && !profile?.telefone
    if (isNewGoogleUser && !pathname.startsWith('/cadastro')) {
      return NextResponse.redirect(new URL('/cadastro?method=google', request.url))
    }

    const needsVerification = profile && profile.status !== 'ativo' && !profile.is_admin

    // MFA ENFORCEMENT
    const { data: mfaLevel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (user.factors?.some((f: any) => f.status === 'verified')) {
      if (mfaLevel?.currentLevel !== 'aal2' && mfaLevel?.nextLevel === 'aal2') {
        return NextResponse.redirect(new URL('/login?mfa=true', request.url))
      }
    }

    if (needsVerification && !pathname.startsWith('/aguardando-verificacao')) {
      return NextResponse.redirect(new URL('/aguardando-verificacao', request.url))
    }

    if (!needsVerification && pathname.startsWith('/aguardando-verificacao')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isAdminRoute && !profile?.is_admin) {
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

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://http2.mlstatic.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.mercadopago.com https://*.mercadopago.com.br https://*.mlstatic.com https://*.mercadolibre.com https://api.mercadolibre.com https://servicodados.ibge.gov.br;
    img-src 'self' data: blob: https://*.supabase.co https://*.mercadopago.com https://*.mercadopago.com.br https://*.mlstatic.com https://*.mercadolibre.com https://*.mercadolivre.com.br https://img.youtube.com https://i.ytimg.com https://*.imgur.com https://grainy-gradients.vercel.app https://lh3.googleusercontent.com https://*.googleusercontent.com;
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'self' https://*.mercadopago.com https://*.mercadopago.com.br https://*.mercadolibre.com https://*.mercadolivre.com.br https://www.youtube.com https://youtube.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()
  h.set('Content-Security-Policy', cspHeader)

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}