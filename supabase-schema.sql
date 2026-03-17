-- ============================================
-- ScoutJR — Supabase Schema
-- Execute no SQL Editor do Supabase
-- ============================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- busca por texto

-- -----------------------------------------------
-- ENUM types
-- -----------------------------------------------
create type user_role as enum ('responsavel', 'clube', 'admin');
create type plano_clube as enum ('starter', 'pro', 'enterprise');
create type status_assinatura as enum ('active', 'trialing', 'past_due', 'canceled', 'unpaid');
create type posicao as enum ('GK','LD','LE','ZAG','VOL','MEI','EXT','SA','CA');
create type pe_dominante as enum ('destro','canhoto','ambidestro');
create type status_interesse as enum ('pendente','aceito','recusado');

-- -----------------------------------------------
-- PROFILES (espelha auth.users)
-- -----------------------------------------------
create table profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid unique not null references auth.users(id) on delete cascade,
  role        user_role not null default 'responsavel',
  nome        text not null,
  email       text not null,
  telefone    text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------
-- ATLETAS
-- -----------------------------------------------
create table atletas (
  id                      uuid primary key default uuid_generate_v4(),
  responsavel_id          uuid not null references profiles(id) on delete cascade,
  nome                    text not null,
  data_nascimento         date not null,
  estado                  char(2) not null,
  cidade                  text not null,
  posicao                 posicao not null,
  posicao_secundaria      posicao,
  pe_dominante            pe_dominante not null default 'destro',
  altura_cm               smallint check (altura_cm between 100 and 230),
  peso_kg                 smallint check (peso_kg between 20 and 130),
  clube_atual             text,
  descricao               text check (char_length(descricao) <= 500),
  foto_url                text,
  -- habilidades
  habilidade_tecnica      smallint not null default 50 check (habilidade_tecnica between 1 and 99),
  habilidade_velocidade   smallint not null default 50 check (habilidade_velocidade between 1 and 99),
  habilidade_visao        smallint not null default 50 check (habilidade_visao between 1 and 99),
  habilidade_fisico       smallint not null default 50 check (habilidade_fisico between 1 and 99),
  habilidade_finalizacao  smallint not null default 50 check (habilidade_finalizacao between 1 and 99),
  habilidade_passes       smallint not null default 50 check (habilidade_passes between 1 and 99),
  -- visibilidade
  destaque_ativo          boolean not null default false,
  destaque_expira_em      timestamptz,
  visivel                 boolean not null default true,
  exibir_cidade           boolean not null default true,
  aceitar_mensagens       boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- -----------------------------------------------
-- ATLETA STATS
-- -----------------------------------------------
create table atleta_stats (
  id            uuid primary key default uuid_generate_v4(),
  atleta_id     uuid not null references atletas(id) on delete cascade,
  temporada     smallint not null,
  jogos         smallint not null default 0,
  gols          smallint not null default 0,
  assistencias  smallint not null default 0,
  nota_media    numeric(3,1) check (nota_media between 0 and 10),
  created_at    timestamptz not null default now(),
  unique(atleta_id, temporada)
);

-- -----------------------------------------------
-- ATLETA VIDEOS
-- -----------------------------------------------
create table atleta_videos (
  id                uuid primary key default uuid_generate_v4(),
  atleta_id         uuid not null references atletas(id) on delete cascade,
  titulo            text not null,
  url               text not null,
  duracao_segundos  int,
  created_at        timestamptz not null default now()
);

-- -----------------------------------------------
-- ATLETA CONQUISTAS
-- -----------------------------------------------
create table atleta_conquistas (
  id          uuid primary key default uuid_generate_v4(),
  atleta_id   uuid not null references atletas(id) on delete cascade,
  titulo      text not null,
  descricao   text,
  ano         smallint not null,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------
-- CLUBES
-- -----------------------------------------------
create table clubes (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid unique not null references auth.users(id) on delete cascade,
  nome                  text not null,
  cnpj                  text,
  estado                char(2) not null,
  cidade                text not null,
  logo_url              text,
  descricao             text,
  verificado            boolean not null default false,
  verificado_em         timestamptz,
  plano                 plano_clube,
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  status_assinatura     status_assinatura,
  assinatura_expira_em  timestamptz,
  creditos_contato      int not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- -----------------------------------------------
-- INTERESSES
-- -----------------------------------------------
create table interesses (
  id          uuid primary key default uuid_generate_v4(),
  clube_id    uuid not null references clubes(id) on delete cascade,
  atleta_id   uuid not null references atletas(id) on delete cascade,
  mensagem    text check (char_length(mensagem) <= 1000),
  status      status_interesse not null default 'pendente',
  created_at  timestamptz not null default now(),
  unique(clube_id, atleta_id)
);

-- -----------------------------------------------
-- FAVORITOS
-- -----------------------------------------------
create table favoritos (
  id          uuid primary key default uuid_generate_v4(),
  clube_id    uuid not null references clubes(id) on delete cascade,
  atleta_id   uuid not null references atletas(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(clube_id, atleta_id)
);

-- -----------------------------------------------
-- ÍNDICES (performance)
-- -----------------------------------------------
create index idx_atletas_responsavel on atletas(responsavel_id);
create index idx_atletas_posicao on atletas(posicao);
create index idx_atletas_estado on atletas(estado);
create index idx_atletas_destaque on atletas(destaque_ativo) where destaque_ativo = true;
create index idx_atletas_visivel on atletas(visivel) where visivel = true;
create index idx_atletas_nome_trgm on atletas using gin(nome gin_trgm_ops);
create index idx_interesses_clube on interesses(clube_id);
create index idx_interesses_atleta on interesses(atleta_id);
create index idx_favoritos_clube on favoritos(clube_id);

-- -----------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------

-- Habilitar RLS em todas as tabelas
alter table profiles enable row level security;
alter table atletas enable row level security;
alter table atleta_stats enable row level security;
alter table atleta_videos enable row level security;
alter table atleta_conquistas enable row level security;
alter table clubes enable row level security;
alter table interesses enable row level security;
alter table favoritos enable row level security;

-- PROFILES
create policy "Usuário lê próprio perfil"
  on profiles for select using (auth.uid() = user_id);

create policy "Usuário atualiza próprio perfil"
  on profiles for update using (auth.uid() = user_id);

create policy "Perfil criado pelo sistema"
  on profiles for insert with check (auth.uid() = user_id);

-- ATLETAS — responsável gerencia, clube visualiza (se visível)
create policy "Responsável gerencia seus atletas"
  on atletas for all
  using (responsavel_id = (select id from profiles where user_id = auth.uid()));

create policy "Clubes visualizam atletas visíveis"
  on atletas for select
  using (
    visivel = true
    and exists (
      select 1 from clubes
      where user_id = auth.uid()
      and status_assinatura in ('active', 'trialing')
    )
  );

-- ATLETA_STATS / VIDEOS / CONQUISTAS — segue permissão do atleta
create policy "Responsável gerencia stats do atleta"
  on atleta_stats for all
  using (
    atleta_id in (
      select id from atletas
      where responsavel_id = (select id from profiles where user_id = auth.uid())
    )
  );

create policy "Clubes visualizam stats de atletas visíveis"
  on atleta_stats for select
  using (
    atleta_id in (select id from atletas where visivel = true)
    and exists (select 1 from clubes where user_id = auth.uid() and status_assinatura in ('active','trialing'))
  );

create policy "Responsável gerencia videos do atleta"
  on atleta_videos for all
  using (
    atleta_id in (
      select id from atletas
      where responsavel_id = (select id from profiles where user_id = auth.uid())
    )
  );

create policy "Clubes visualizam videos de atletas visíveis"
  on atleta_videos for select
  using (
    atleta_id in (select id from atletas where visivel = true)
    and exists (select 1 from clubes where user_id = auth.uid() and status_assinatura in ('active','trialing'))
  );

create policy "Responsável gerencia conquistas do atleta"
  on atleta_conquistas for all
  using (
    atleta_id in (
      select id from atletas
      where responsavel_id = (select id from profiles where user_id = auth.uid())
    )
  );

create policy "Clubes visualizam conquistas de atletas visíveis"
  on atleta_conquistas for select
  using (
    atleta_id in (select id from atletas where visivel = true)
    and exists (select 1 from clubes where user_id = auth.uid() and status_assinatura in ('active','trialing'))
  );

-- CLUBES
create policy "Clube gerencia próprio perfil"
  on clubes for all using (user_id = auth.uid());

-- INTERESSES
create policy "Clube gerencia seus interesses"
  on interesses for all
  using (clube_id = (select id from clubes where user_id = auth.uid()));

create policy "Responsável visualiza interesses em seus atletas"
  on interesses for select
  using (
    atleta_id in (
      select id from atletas
      where responsavel_id = (select id from profiles where user_id = auth.uid())
    )
  );

-- FAVORITOS
create policy "Clube gerencia seus favoritos"
  on favoritos for all
  using (clube_id = (select id from clubes where user_id = auth.uid()));

-- -----------------------------------------------
-- TRIGGERS
-- -----------------------------------------------

-- Auto-atualiza updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger trg_atletas_updated_at
  before update on atletas
  for each row execute function update_updated_at();

create trigger trg_clubes_updated_at
  before update on clubes
  for each row execute function update_updated_at();

-- Auto-cria profile após signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, nome, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'responsavel')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
