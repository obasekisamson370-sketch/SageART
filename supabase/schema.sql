-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Safe to re-run: every statement guards against "already exists".

create extension if not exists "pgcrypto";

create table if not exists portraits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  tags text[] not null default '{}',
  price numeric,
  created_at timestamptz not null default now()
);

alter table portraits enable row level security;

-- Public gallery: anyone may read.
drop policy if exists "Public can read portraits" on portraits;
create policy "Public can read portraits"
  on portraits for select
  using (true);

-- No public insert/update/delete policy on purpose.
-- The /admin area writes using the service_role key server-side,
-- which bypasses RLS, so no public write policy is needed.

-- Storage bucket for portrait images (public read).
insert into storage.buckets (id, name, public)
values ('portraits', 'portraits', true)
on conflict (id) do nothing;

-- The bucket is public, so images already serve over the public endpoint.
-- This policy is belt-and-suspenders for any RLS-scoped access.
drop policy if exists "Public can view portrait images" on storage.objects;
create policy "Public can view portrait images"
  on storage.objects for select
  using (bucket_id = 'portraits');
