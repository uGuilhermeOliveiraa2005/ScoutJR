import { z } from 'zod'

// -----------------------------------------------
// Auth
// -----------------------------------------------
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const cadastroResponsavelSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto').max(100),
  email: z.string().email('E-mail inválido'),
  telefone: z
    .string()
    .min(10, 'Telefone inválido')
    .regex(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/, 'Formato inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa de ao menos 1 letra maiúscula')
    .regex(/[0-9]/, 'Precisa de ao menos 1 número'),
  confirmPassword: z.string(),
  aceito_termos: z.boolean().refine(val => val === true, {
    message: 'Você precisa aceitar os termos',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const cadastroClubeSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto').max(100),
  cnpj: z
    .string()
    .optional()
    .refine(val => !val || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val), {
      message: 'CNPJ inválido (00.000.000/0000-00)',
    }),
  email: z.string().email('E-mail inválido'),
  telefone: z
    .string()
    .min(10, 'Telefone inválido'),
  estado: z.string().min(2, 'Selecione o estado'),
  cidade: z.string().min(2, 'Informe a cidade'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa de ao menos 1 letra maiúscula')
    .regex(/[0-9]/, 'Precisa de ao menos 1 número'),
  confirmPassword: z.string(),
  aceito_termos: z.boolean().refine(val => val === true, {
    message: 'Você precisa aceitar os termos',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const recuperarSenhaSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const novaSenhaSchema = z.object({
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa de ao menos 1 letra maiúscula')
    .regex(/[0-9]/, 'Precisa de ao menos 1 número'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

// -----------------------------------------------
// Atleta
// -----------------------------------------------
export const atletaSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto').max(100),
  data_nascimento: z
    .string()
    .refine(val => {
      const date = new Date(val)
      const age = new Date().getFullYear() - date.getFullYear()
      return age >= 5 && age <= 17
    }, 'Idade deve ser entre 5 e 17 anos'),
  estado: z.string().min(2, 'Selecione o estado'),
  cidade: z.string().min(2, 'Informe a cidade'),
  posicao: z.enum(['GK','LD','LE','ZAG','VOL','MEI','EXT','SA','CA']),
  posicao_secundaria: z.enum(['GK','LD','LE','ZAG','VOL','MEI','EXT','SA','CA']).optional(),
  pe_dominante: z.enum(['destro','canhoto','ambidestro']),
  altura_cm: z.coerce.number().min(100).max(220).optional(),
  peso_kg: z.coerce.number().min(20).max(120).optional(),
  clube_atual: z.string().max(100).optional(),
  descricao: z.string().max(500).optional(),
  habilidade_tecnica: z.coerce.number().min(1).max(99),
  habilidade_velocidade: z.coerce.number().min(1).max(99),
  habilidade_visao: z.coerce.number().min(1).max(99),
  habilidade_fisico: z.coerce.number().min(1).max(99),
  habilidade_finalizacao: z.coerce.number().min(1).max(99),
  habilidade_passes: z.coerce.number().min(1).max(99),
})

// -----------------------------------------------
// Busca
// -----------------------------------------------
export const buscaSchema = z.object({
  posicao: z.string().optional(),
  estado: z.string().optional(),
  idade_min: z.coerce.number().min(5).max(17).optional(),
  idade_max: z.coerce.number().min(5).max(17).optional(),
  nota_min: z.coerce.number().min(0).max(99).optional(),
  pe_dominante: z.string().optional(),
  apenas_destaques: z.boolean().optional(),
  ordenar: z.enum(['nota_desc','nota_asc','recente','nome']).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CadastroResponsavelInput = z.infer<typeof cadastroResponsavelSchema>
export type CadastroClubeInput = z.infer<typeof cadastroClubeSchema>
export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>
export type NovaSenhaInput = z.infer<typeof novaSenhaSchema>
export type AtletaInput = z.infer<typeof atletaSchema>
export type BuscaInput = z.infer<typeof buscaSchema>
