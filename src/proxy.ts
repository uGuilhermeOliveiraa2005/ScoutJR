// ============================================
// ScoutJR — Proxy (Next.js 16+)
// CAMINHO: src/proxy.ts
// ============================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/perfil', '/busca', '/configuracoes', '/admin', '/checkout', '/aguardando-verificacao']
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
    // Permite que usuários recém-autenticados via Google finalizem seu cadastro
    const isGoogleSignup = pathname === '/cadastro' && request.nextUrl.searchParams.get('method') === 'google'

    const { data: profile } = await supabase.from('profiles').select('telefone').eq('user_id', user.id).single()

    if (isGoogleSignup) {
      if (profile && profile.telefone) {
        // Se já tem conta completa, não pode burlar lendo o form de cadastro de novo:
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      // Se n tem telefone, deixa o request seguir (entra pra renderizar o React do cadastro)
    } else {
      if (!profile || !profile.telefone) {
        return NextResponse.redirect(new URL('/cadastro?method=google', request.url))
      }

      const { data: mfaLevel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      const needsMfa = mfaLevel?.currentLevel !== 'aal2' && mfaLevel?.nextLevel === 'aal2'

      if (!needsMfa) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      // Caso precise de MFA, permitimos que ele continue na rota de AUTH (login) para o desafio
    }
  }

  if (isProtected && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, is_admin, telefone')
      .eq('user_id', user.id)
      .single()

    // Se o usuário tem conta mas o perfil é nulo ou o telefone é nulo, 
    // significa que ele logou via Google mas nunca completou o fluxo de cadastro.
    // Forçamos ele a terminar o cadastro.
    if (!profile || (!profile.telefone && !pathname.startsWith('/cadastro'))) {
      if (!pathname.startsWith('/cadastro')) {
        return NextResponse.redirect(new URL('/cadastro?method=google', request.url))
      }
    }

    const needsVerification = profile && profile.status !== 'ativo' && !profile.is_admin

    // MFA ENFORCEMENT
    // Verificamos o nível de segurança do usuário atual
    const { data: mfaLevel } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    // Se o usuário tem fatores de MFA verificados mas a sessão está em AAL1,
    // redirecionamos para o desafio.
    if (user.factors?.some((f: any) => f.status === 'verified')) {
      if (mfaLevel?.currentLevel !== 'aal2' && mfaLevel?.nextLevel === 'aal2') {
        return NextResponse.redirect(new URL('/login?mfa=true', request.url))
      }
    }

    // Se precisa de verificação e NÃO está na página de espera -> Redireciona para espera
    if (needsVerification && !pathname.startsWith('/aguardando-verificacao')) {
      return NextResponse.redirect(new URL('/aguardando-verificacao', request.url))
    }

    // Se NÃO precisa de verificação mas está na página de espera -> Redireciona para dashboard
    if (!needsVerification && pathname.startsWith('/aguardando-verificacao')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check Admin Route specifically
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
    img-src 'self' data: https://*.supabase.co https://*.googleusercontent.com https://*.mercadopago.com https://*.mercadopago.com.br https://*.mlstatic.com https://*.mercadolibre.com https://*.mercadolivre.com.br https://img.youtube.com https://i.ytimg.com https://*.imgur.com https://grainy-gradients.vercel.app;
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