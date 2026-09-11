-- Persistencia exclusiva del Laboratorio de Automatización.
-- Aplicar en el SQL Editor del proyecto de Supabase (o CLI).
--
-- El laboratorio usa la service role SOLO en el servidor
-- (`LAB_SUPABASE_SERVICE_ROLE_KEY`, nunca NEXT_PUBLIC_).
-- RLS está activo y NO hay políticas: anon/authenticated no pueden leer.
-- El TTL de visitor_* lo aplica la aplicación (expires_at, 2 h).

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table if not exists public.lab_runs (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  access_token_hash text not null,
  email_hash text not null,
  ip_hash text not null,
  payload_hash text not null,
  -- Instantánea de la entrada: necesaria para PDF/seguimiento tras reentrar.
  -- Caduca con expires_at. No se usa fuera del laboratorio.
  visitor_name text,
  visitor_email text,
  visitor_message text,
  route_id text not null,
  classification jsonb not null default '{}'::jsonb,
  status text not null default 'accepted',
  duplicate boolean not null default false,
  internal_email_id text,
  visitor_email_id text,
  followup_email_id text,
  followup_scheduled_at timestamptz,
  followup_canceled boolean not null default false,
  degraded_reason text,
  usage jsonb not null default '{}'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  capabilities jsonb not null default '{}'::jsonb
);

create unique index if not exists lab_runs_access_token_hash_idx
  on public.lab_runs (access_token_hash);

create index if not exists lab_runs_expires_at_idx
  on public.lab_runs (expires_at);

create table if not exists public.lab_actions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.lab_runs (id) on delete cascade,
  type text not null,
  execution_mode text not null,
  status text not null,
  provider_id text,
  detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, type)
);

create table if not exists public.lab_followups (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null unique references public.lab_runs (id) on delete cascade,
  provider_id text,
  status text not null,
  execution_mode text not null,
  scheduled_at timestamptz,
  cancelled_at timestamptz,
  reschedules integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.lab_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.lab_runs (id) on delete cascade,
  event text not null,
  detail text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists lab_events_run_id_idx
  on public.lab_events (run_id, created_at desc);

-- Candado de deduplicación: un hash de email activo a la vez.
create table if not exists public.lab_dedup (
  email_hash text primary key,
  run_id uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.lab_quota_hits (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists lab_quota_hits_ip_created_idx
  on public.lab_quota_hits (ip_hash, created_at desc);

create table if not exists public.lab_rate_hits (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists lab_rate_hits_ip_created_idx
  on public.lab_rate_hits (ip_hash, created_at desc);

create table if not exists public.lab_budget (
  day date primary key,
  emails_sent integer not null default 0
);

-- ---------------------------------------------------------------------------
-- RLS: denegar acceso a roles de cliente
-- ---------------------------------------------------------------------------

alter table public.lab_runs enable row level security;
alter table public.lab_actions enable row level security;
alter table public.lab_followups enable row level security;
alter table public.lab_events enable row level security;
alter table public.lab_dedup enable row level security;
alter table public.lab_quota_hits enable row level security;
alter table public.lab_rate_hits enable row level security;
alter table public.lab_budget enable row level security;

revoke all on table public.lab_runs from anon, authenticated, public;
revoke all on table public.lab_actions from anon, authenticated, public;
revoke all on table public.lab_followups from anon, authenticated, public;
revoke all on table public.lab_events from anon, authenticated, public;
revoke all on table public.lab_dedup from anon, authenticated, public;
revoke all on table public.lab_quota_hits from anon, authenticated, public;
revoke all on table public.lab_rate_hits from anon, authenticated, public;
revoke all on table public.lab_budget from anon, authenticated, public;

grant all on table public.lab_runs to service_role;
grant all on table public.lab_actions to service_role;
grant all on table public.lab_followups to service_role;
grant all on table public.lab_events to service_role;
grant all on table public.lab_dedup to service_role;
grant all on table public.lab_quota_hits to service_role;
grant all on table public.lab_rate_hits to service_role;
grant all on table public.lab_budget to service_role;

-- ---------------------------------------------------------------------------
-- Funciones: solo service_role. anon/authenticated no pueden ejecutarlas.
-- ---------------------------------------------------------------------------

-- Anula nombre/email/mensaje de ejecuciones caducadas. El acceso a la
-- ejecución ya falla por expires_at; esto evita que el PII quede indefinido.
create or replace function public.lab_scrub_expired()
returns void
language sql
security definer
set search_path = public
as $$
  update public.lab_runs
  set
    visitor_name = null,
    visitor_email = null,
    visitor_message = null,
    updated_at = now()
  where expires_at <= now()
    and (
      visitor_name is not null
      or visitor_email is not null
      or visitor_message is not null
    );
$$;

-- Reserva atómica del presupuesto diario. True solo si cabía `n`.
create or replace function public.lab_try_consume_email_budget(
  n integer,
  daily_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if n is null or n < 0 or daily_limit is null or daily_limit < 0 then
    return false;
  end if;
  if n = 0 then
    return true;
  end if;

  insert into public.lab_budget as b (day, emails_sent)
  values ((timezone('utc', now()))::date, 0)
  on conflict (day) do nothing;

  update public.lab_budget
  set emails_sent = emails_sent + n
  where day = (timezone('utc', now()))::date
    and emails_sent + n <= daily_limit;

  return found;
end;
$$;

create or replace function public.lab_refund_email_budget(n integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if n is null or n <= 0 then
    return;
  end if;
  update public.lab_budget
  set emails_sent = greatest(0, emails_sent - n)
  where day = (timezone('utc', now()))::date;
end;
$$;

-- Candado de duplicados con fila bloqueada: dos POST simultáneos no crean
-- dos ejecuciones reales.
create or replace function public.lab_claim_dedup(
  p_email_hash text,
  p_run_id uuid,
  p_ttl_seconds integer
)
returns table (is_duplicate boolean, existing_run_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  lock_run uuid;
  lock_exp timestamptz;
  new_exp timestamptz := now() + make_interval(secs => p_ttl_seconds);
begin
  perform pg_advisory_xact_lock(881177, hashtext(p_email_hash));

  insert into public.lab_dedup (email_hash, run_id, expires_at)
  values (p_email_hash, p_run_id, new_exp)
  on conflict (email_hash) do nothing;

  if found then
    return query select false, null::uuid;
    return;
  end if;

  select d.run_id, d.expires_at
  into lock_run, lock_exp
  from public.lab_dedup d
  where d.email_hash = p_email_hash
  for update;

  if lock_run is null then
    insert into public.lab_dedup (email_hash, run_id, expires_at)
    values (p_email_hash, p_run_id, new_exp);
    return query select false, null::uuid;
    return;
  end if;

  if lock_exp <= now()
     or not exists (
       select 1
       from public.lab_runs r
       where r.id = lock_run
         and r.expires_at > now()
     )
  then
    update public.lab_dedup
    set run_id = p_run_id,
        expires_at = new_exp,
        created_at = now()
    where email_hash = p_email_hash;
    return query select false, null::uuid;
    return;
  end if;

  return query select true, lock_run;
end;
$$;

revoke all on function public.lab_scrub_expired() from public, anon, authenticated;
revoke all on function public.lab_try_consume_email_budget(integer, integer) from public, anon, authenticated;
revoke all on function public.lab_refund_email_budget(integer) from public, anon, authenticated;
revoke all on function public.lab_claim_dedup(text, uuid, integer) from public, anon, authenticated;

grant execute on function public.lab_scrub_expired() to service_role;
grant execute on function public.lab_try_consume_email_budget(integer, integer) to service_role;
grant execute on function public.lab_refund_email_budget(integer) to service_role;
grant execute on function public.lab_claim_dedup(text, uuid, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Participantes del laboratorio (distinto de lab_runs)
-- ---------------------------------------------------------------------------
-- Registro interno de quién ha probado la experiencia. Reutiliza nombre,
-- email y la clasificación/ruta ya calculadas. No guarda mensaje, IP ni
-- user-agent. No es una lista de marketing: el email no implica consentimiento
-- comercial.
--
-- lab_runs sigue siendo la traza técnica (TTL 2 h + scrub de PII).
-- lab_contacts no usa ese TTL: si se borrara a las 2 h no serviría como
-- registro de participantes. La conservación está limitada a 12 meses desde
-- last_seen_at (misma idea que «el tiempo necesario para atender / retomar»,
-- con un tope; no es retención indefinida).

create table if not exists public.lab_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_hash text not null unique,
  name text,
  business_type text,
  goal text,
  current_method text,
  blocker text,
  timeframe text,
  route text,
  experiences_completed integer not null default 0,
  demo_completed boolean not null default false,
  cta_clicked boolean not null default false,
  source text not null default 'laboratorio',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  test_count integer not null default 1,
  last_run_id uuid null references public.lab_runs (id) on delete set null
);

create index if not exists lab_contacts_last_seen_idx
  on public.lab_contacts (last_seen_at);

alter table public.lab_contacts enable row level security;

revoke all on table public.lab_contacts from anon, authenticated, public;
grant all on table public.lab_contacts to service_role;

create or replace function public.lab_purge_stale_contacts()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.lab_contacts
  where last_seen_at <= now() - interval '12 months';
$$;

create or replace function public.lab_upsert_contact(
  p_email text,
  p_email_hash text,
  p_name text,
  p_goal text,
  p_route text,
  p_last_run_id uuid
)
returns setof public.lab_contacts
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.lab_purge_stale_contacts();

  return query
  insert into public.lab_contacts (
    email,
    email_hash,
    name,
    goal,
    route,
    last_run_id,
    experiences_completed,
    source
  )
  values (
    p_email,
    p_email_hash,
    p_name,
    p_goal,
    p_route,
    p_last_run_id,
    1,
    'laboratorio'
  )
  on conflict (email_hash) do update set
    last_seen_at = now(),
    test_count = public.lab_contacts.test_count + 1,
    name = coalesce(excluded.name, public.lab_contacts.name),
    goal = coalesce(excluded.goal, public.lab_contacts.goal),
    route = coalesce(excluded.route, public.lab_contacts.route),
    last_run_id = coalesce(excluded.last_run_id, public.lab_contacts.last_run_id),
    experiences_completed = greatest(public.lab_contacts.experiences_completed, 1)
  returning *;
end;
$$;

create or replace function public.lab_update_contact_progress(
  p_email_hash text,
  p_experiences integer,
  p_demo boolean,
  p_cta boolean
)
returns setof public.lab_contacts
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.lab_contacts
  set
    last_seen_at = now(),
    experiences_completed = greatest(
      experiences_completed,
      coalesce(p_experiences, experiences_completed)
    ),
    demo_completed = demo_completed or coalesce(p_demo, false),
    cta_clicked = cta_clicked or coalesce(p_cta, false)
  where email_hash = p_email_hash
  returning *;
end;
$$;

revoke all on function public.lab_purge_stale_contacts() from public, anon, authenticated;
revoke all on function public.lab_upsert_contact(text, text, text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.lab_update_contact_progress(text, integer, boolean, boolean) from public, anon, authenticated;

grant execute on function public.lab_purge_stale_contacts() to service_role;
grant execute on function public.lab_upsert_contact(text, text, text, text, text, uuid) to service_role;
grant execute on function public.lab_update_contact_progress(text, integer, boolean, boolean) to service_role;

notify pgrst, 'reload schema';

-- Limpieza periódica: no se programa pg_cron aquí (no está en todos los planes
-- free). El servidor llama lab_scrub_expired() en cada lectura/alta. Más
-- adelante, si el plan lo permite:
--   select cron.schedule(
--     'lab-scrub-expired',
--     '*/15 * * * *',
--     $$select public.lab_scrub_expired()$$
--   );
