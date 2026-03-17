// ============================================
// ScoutJR — Global Types
// ============================================

export type UserRole = 'responsavel' | 'clube' | 'admin'

export type PlanoClube = 'starter' | 'pro' | 'enterprise'

export type StatusAssinatura = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'

export type Posicao =
  | 'GK' | 'LD' | 'LE' | 'ZAG'
  | 'VOL' | 'MEI' | 'EXT' | 'SA' | 'CA'

export type PeDominante = 'destro' | 'canhoto' | 'ambidestro'

// -----------------------------------------------
// Database row types (espelham as tabelas Supabase)
// -----------------------------------------------

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  nome: string
  email: string
  telefone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Atleta {
  id: string
  responsavel_id: string
  nome: string
  data_nascimento: string
  estado: string
  cidade: string
  posicao: Posicao
  posicao_secundaria: Posicao | null
  pe_dominante: PeDominante
  altura_cm: number | null
  peso_kg: number | null
  clube_atual: string | null
  descricao: string | null
  foto_url: string | null
  // habilidades (0–99)
  habilidade_tecnica: number
  habilidade_velocidade: number
  habilidade_visao: number
  habilidade_fisico: number
  habilidade_finalizacao: number
  habilidade_passes: number
  // visibilidade
  destaque_ativo: boolean
  destaque_expira_em: string | null
  visivel: boolean
  exibir_cidade: boolean
  aceitar_mensagens: boolean
  created_at: string
  updated_at: string
}

export interface AtletaStats {
  id: string
  atleta_id: string
  temporada: number
  jogos: number
  gols: number
  assistencias: number
  nota_media: number
  created_at: string
}

export interface AtletaVideo {
  id: string
  atleta_id: string
  titulo: string
  url: string
  duracao_segundos: number | null
  created_at: string
}

export interface AtletaConquista {
  id: string
  atleta_id: string
  titulo: string
  descricao: string | null
  ano: number
  created_at: string
}

export interface Clube {
  id: string
  user_id: string
  nome: string
  cnpj: string | null
  estado: string
  cidade: string
  logo_url: string | null
  descricao: string | null
  verificado: boolean
  verificado_em: string | null
  plano: PlanoClube | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status_assinatura: StatusAssinatura | null
  assinatura_expira_em: string | null
  creditos_contato: number
  created_at: string
  updated_at: string
}

export interface Interesse {
  id: string
  clube_id: string
  atleta_id: string
  mensagem: string | null
  status: 'pendente' | 'aceito' | 'recusado'
  created_at: string
}

export interface Favorito {
  id: string
  clube_id: string
  atleta_id: string
  created_at: string
}

// -----------------------------------------------
// Forms
// -----------------------------------------------

export interface LoginForm {
  email: string
  password: string
}

export interface CadastroResponsavelForm {
  nome: string
  email: string
  telefone: string
  password: string
  confirmPassword: string
  aceito_termos: boolean
}

export interface CadastroClubeForm {
  nome: string
  cnpj: string
  email: string
  telefone: string
  estado: string
  cidade: string
  password: string
  confirmPassword: string
  aceito_termos: boolean
}

export interface AtletaForm {
  nome: string
  data_nascimento: string
  estado: string
  cidade: string
  posicao: Posicao
  posicao_secundaria?: Posicao
  pe_dominante: PeDominante
  altura_cm?: number
  peso_kg?: number
  clube_atual?: string
  descricao?: string
  habilidade_tecnica: number
  habilidade_velocidade: number
  habilidade_visao: number
  habilidade_fisico: number
  habilidade_finalizacao: number
  habilidade_passes: number
}

export interface BuscaFiltros {
  posicao?: Posicao | ''
  estado?: string
  cidade?: string
  idade_min?: number
  idade_max?: number
  nota_min?: number
  pe_dominante?: PeDominante | ''
  apenas_destaques?: boolean
  ordenar?: 'nota_desc' | 'nota_asc' | 'recente' | 'nome'
}

// -----------------------------------------------
// API responses
// -----------------------------------------------

export interface ApiResponse<T = void> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
