create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 1 and 100),
    email text not null unique check (email = lower(btrim(email)) and char_length(email) <= 254),
    password_hash text not null,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz not null default now()
);

create table if not exists public.discoveries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    external_id bigint not null check (external_id > 0),
    notes text not null default '' check (char_length(notes) <= 5000),
    favorite boolean not null default false,
    status text not null default 'descubierto'
        check (status in ('descubierto', 'investigando', 'observado')),
    created_at timestamptz not null default now(),
    constraint discoveries_user_external_id_unique unique (user_id, external_id)
);

create table if not exists public.taxon_views (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    external_id bigint not null check (external_id > 0),
    viewed_at timestamptz not null default now()
);

create index if not exists discoveries_user_created_at_idx
    on public.discoveries (user_id, created_at desc);

create index if not exists taxon_views_external_id_idx
    on public.taxon_views (external_id);

alter table public.users enable row level security;
alter table public.discoveries enable row level security;
alter table public.taxon_views enable row level security;

create or replace view public.admin_most_saved
with (security_invoker = true)
as
select external_id, count(*)::bigint as saved_count
from public.discoveries
group by external_id;

create or replace view public.admin_most_viewed
with (security_invoker = true)
as
select external_id, count(*)::bigint as view_count
from public.taxon_views
group by external_id;

insert into public.users (name, email, password_hash, role)
values (
    'Explorador demo',
    'atlas.demo@example.test',
    '$2b$10$W7a1SS6rgxNZJ5LJRLkA9uL8OGAer3r7VR9i01x2ba.p.pG.pga8K',
    'user'
)
on conflict (email) do nothing;

insert into public.discoveries (user_id, external_id, notes, favorite, status)
select id, 6930, 'Registro de ejemplo para probar Mi Atlas.', false, 'descubierto'
from public.users
where email = 'atlas.demo@example.test'
on conflict (user_id, external_id) do nothing;
