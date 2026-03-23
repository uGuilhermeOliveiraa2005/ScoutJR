import { z } from 'zod'
import { cpf, cnpj } from 'cpf-cnpj-validator'

const passwordRule = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\W])[A-Za-z\d@$!%*?&\W]{8,}$/, 'Senha deve conter Maiúscula, Minúscula, Número e Símbolo')

const fullNameRule = z
  .string()
  .trim()
  .min(3, 'Nome muito curto')
  .max(100)
  .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/, 'Digite o nome completo (Apenas letras, Nome e Sobrenome)')

const emailRule = z.string().trim().toLowerCase().email('E-mail inválido')

const phoneRule = z
  .string()
  .trim()
  .regex(/^\(?([1-9]{2})\)?[\s-]?9\d{4}[\s-]?\d{4}$/, 'Telefone inválido. Formato: (11) 99999-9999')

const futureDateRule = z.string().refine(val => {
  const date = new Date(val)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date <= today
}, 'A data não pode estar no futuro')

// -----------------------------------------------
// Auth
// -----------------------------------------------
export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type StatusVerificacao = 'pendente' | 'ativo' | 'rejeitado'

export const profileSchema = z.object({
  nome: fullNameRule,
  email: emailRule,
  telefone: phoneRule,
  status: z.enum(['pendente', 'ativo', 'rejeitado']).default('pendente'),
  is_admin: z.boolean().default(false),
})

export const cadastroResponsavelSchema = z.object({
  nome: fullNameRule,
  email: emailRule,
  telefone: phoneRule,
  password: passwordRule,
  confirmPassword: z.string(),
  foto_url: z.any().optional(),
  aceito_termos: z.boolean().refine(val => val === true, {
    message: 'Você precisa aceitar os termos',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const cadastroEscolinhaSchema = z.object({
  nome: fullNameRule,
  cnpj: z
    .string()
    .min(14, 'CNPJ obrigatório para escolinhas')
    .refine(val => cnpj.isValid(val), {
      message: 'CNPJ inválido ou matematicamente incorreto',
    }),
  email: emailRule,
  telefone: phoneRule,
  estado: z.string().min(2, 'Selecione o estado'),
  cidade: z.string().trim().min(2, 'Informe a cidade'),
  foto_url: z.any().optional(),
  descricao: z.string().optional(),
  fotos_adicionais: z.any().optional(),
  password: passwordRule,
  confirmPassword: z.string(),
  aceito_termos: z.boolean().refine(val => val === true, {
    message: 'Você precisa aceitar os termos',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const recuperarSenhaSchema = z.object({
  email: emailRule,
})

export const novaSenhaSchema = z.object({
  password: passwordRule,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

// -----------------------------------------------
// Atleta
// -----------------------------------------------
export const atletaSchema = z.object({
  nome: fullNameRule,
  data_nascimento: futureDateRule.and(z.string().refine(val => {
    const date = new Date(val)
    const age = new Date().getFullYear() - date.getFullYear()
    return age >= 5 && age <= 17
  }, 'A idade do atleta deve estar entre 5 e 17 anos no ano corrente')),
  estado: z.string().min(2, 'Selecione o estado'),
  cidade: z.string().min(2, 'Informe a cidade'),
  posicao: z.enum(['GK','LD','LE','ZAG','VOL','MEI','EXT','SA','CA']),
  posicao_secundaria: z.enum(['GK','LD','LE','ZAG','VOL','MEI','EXT','SA','CA']).optional(),
  pe_dominante: z.enum(['destro','canhoto','ambidestro']),
  altura_cm: z.coerce.number().min(100).max(220).optional(),
  peso_kg: z.coerce.number().min(20).max(120).optional(),
  escolinha_atual: z.string().trim().max(100).optional(),
  descricao: z.string().trim()
    .max(500)
    .regex(/^[^<>]*$/, 'Caracteres HTML (< ou >) não são permitidos por segurança')
    .optional(),
  habilidade_tecnica: z.coerce.number().min(1).max(99),
  habilidade_velocidade: z.coerce.number().min(1).max(99),
  habilidade_visao: z.coerce.number().min(1).max(99),
  habilidade_fisico: z.coerce.number().min(1).max(99),
  habilidade_finalizacao: z.coerce.number().min(1).max(99),
  habilidade_passes: z.coerce.number().min(1).max(99),
  status: z.enum(['pendente', 'ativo', 'rejeitado']).default('pendente'),
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
export type CadastroEscolinhaInput = z.infer<typeof cadastroEscolinhaSchema>
export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>
export type NovaSenhaInput = z.infer<typeof novaSenhaSchema>
export type AtletaInput = z.infer<typeof atletaSchema>
export type BuscaInput = z.infer<typeof buscaSchema>
