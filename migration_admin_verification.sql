-- ============================================
-- SQL de Migração — Sistema de Verificação Administrativa
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Criar tipos ENUM se não existirem
DO $$ BEGIN
    CREATE TYPE status_verificacao AS ENUM ('pendente', 'ativo', 'rejeitado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar colunas à tabela PROFILES
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status status_verificacao NOT NULL DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 3. Adicionar coluna à tabela ATLETAS
-- (Ajuste o nome da tabela se for 'atletas' ou 'atleta')
ALTER TABLE atletas 
ADD COLUMN IF NOT EXISTS status status_verificacao NOT NULL DEFAULT 'pendente';

-- 4. Atualizar RLS (Row Level Security) para ocultar pendentes do público

-- PROFILES (Público só vê ativos)
-- Remova a política de select antiga se necessário ou adicione a condição
DROP POLICY IF EXISTS "Público visualiza perfis ativos" ON profiles;
CREATE POLICY "Público visualiza perfis ativos" 
ON profiles FOR SELECT 
USING (status = 'ativo');

-- Mas o próprio usuário PRECISA ler seu próprio perfil (mesmo pendente)
DROP POLICY IF EXISTS "Usuário lê próprio perfil" ON profiles;
CREATE POLICY "Usuário lê próprio perfil" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Admin lê TUDO
CREATE POLICY "Admin lê tudo (profiles)" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- ATLETAS (Público e Clubes só vêem ativos)
DROP POLICY IF EXISTS "Clubes visualizam atletas ativos" ON atletas;
CREATE POLICY "Clubes visualizam atletas ativos" 
ON atletas FOR SELECT 
USING (
  status = 'ativo' 
  AND visivel = true
  AND EXISTS (
    SELECT 1 FROM escolinhas -- Garanta que o nome da tabela de clubes está correto
    WHERE user_id = auth.uid()
    AND status_assinatura IN ('active', 'trialing')
  )
);

-- Admin lê TUDO (atletas)
CREATE POLICY "Admin lê tudo (atletas)" 
ON atletas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- 5. Definir o primeiro Administrador (Substitua pelo seu email)
-- UPDATE profiles SET is_admin = true, status = 'ativo' WHERE email = 'seu-email@exemplo.com';
