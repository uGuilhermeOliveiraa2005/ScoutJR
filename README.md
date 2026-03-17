# ScoutJR — Next.js App

Plataforma de conexão entre jovens talentos do futebol e clubes/escolinhas.

## Stack

- **Framework:** Next.js 15 + TypeScript
- **Styling:** Tailwind CSS
- **Auth + DB:** Supabase (Auth, PostgreSQL, RLS, Storage)
- **Pagamentos:** Stripe (assinaturas + pagamentos únicos)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## Setup rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Variáveis de ambiente
```bash
cp .env.local.example .env.local
# Preencha com suas chaves do Supabase e Stripe
```

### 3. Banco de dados (Supabase)
- Crie um projeto em supabase.com
- No **SQL Editor**, execute o arquivo `supabase-schema.sql` inteiro
- Isso cria todas as tabelas, RLS, triggers e índices

### 4. Configurar Supabase Auth
Em **Authentication > URL Configuration**:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/api/auth/callback`

### 5. Configurar Stripe
- Crie os 5 produtos no **Stripe Dashboard** (Starter, Pro, Enterprise, Destaque, Verificação)
- Copie os `price_id` de cada produto para o `.env.local`
- Para webhooks locais: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### 6. Rodar
```bash
npm run dev
```

## Estrutura de arquivos

```
src/
  app/
    page.tsx                    # Landing page pública
    login/page.tsx              # Login com validação Zod
    cadastro/page.tsx           # Onboarding multi-step (6 etapas)
    recuperar-senha/page.tsx    # Reset de senha
    dashboard/page.tsx          # Área logada - home
    busca/page.tsx              # Explorador com filtros
    configuracoes/page.tsx      # Conta, plano, segurança
    api/
      auth/callback/route.ts   # Callback OAuth Supabase
      stripe/route.ts          # Criar checkout sessions
      stripe/portal/route.ts   # Billing portal
      webhooks/stripe/route.ts # Processar eventos Stripe
  components/
    ui/Button.tsx               # Botões com variantes
    ui/Form.tsx                 # Input, Select, Label, etc.
    ui/index.tsx                # Badge, Card, Avatar, Toggle, SkillBar
    layout/Navbar.tsx           # NavbarPublic + NavbarDashboard + Footer
    shared/StripeButton.tsx     # Botão de checkout client-side
  lib/
    supabase.ts                 # Clients: browser / server / admin
    stripe.ts                   # Stripe utilities + planos
    utils.ts                    # Helpers, formatters, labels
    validations.ts              # Zod schemas para todos os forms
  types/index.ts                # TypeScript types completos
  middleware.ts                 # Proteção de rotas + security headers
supabase-schema.sql             # Schema completo com RLS e triggers
```

## Segurança implementada

| Camada | O que protege |
|---|---|
| Middleware (Next.js) | Rotas autenticadas, rotas admin, redirect automático |
| Security Headers | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Supabase RLS | Cada tabela tem policies — usuário só acessa seus próprios dados |
| Zod validation | Todos os formulários validados no client e prontos para server-side |
| Webhook signature | Verificação de assinatura Stripe antes de processar qualquer evento |
| Service role key | Nunca exposta no browser — só usada em Route Handlers server-side |
| getUser() no middleware | Mais seguro que getSession() — verifica JWT contra o servidor |

## Próximos passos sugeridos

- [ ] Página `/perfil/[id]` — perfil público do atleta
- [ ] Upload de fotos e vídeos via Supabase Storage
- [ ] Sistema de mensagens clube ↔ família (Supabase Realtime)
- [ ] Notificações push / e-mail (Resend)
- [ ] Painel admin `/admin`
- [ ] Testes automatizados (Vitest + Playwright)
- [ ] Deploy (Vercel + Supabase produção)
