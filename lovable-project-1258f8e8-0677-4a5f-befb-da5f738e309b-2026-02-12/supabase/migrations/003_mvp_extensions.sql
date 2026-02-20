-- ============================================================
-- 003_mvp_extensions.sql
-- Organisations, agent settings, notifications, and schema
-- additions for the EnHub MVP.
-- ============================================================

-- Organisations (pre-seeded by admin; agents pick on signup)
create table organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

alter table organisations enable row level security;

-- Anyone authenticated can read orgs (for the onboarding picker)
create policy "Authenticated users can view organisations"
  on organisations for select
  using (auth.role() = 'authenticated');

-- Add org_id to profiles
alter table profiles add column org_id uuid references organisations(id);

-- Agent settings (one row per agent)
create table agent_settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null unique,
  ai_mode text not null default 'draft'
    check (ai_mode in ('draft', 'safe', 'full')),
  notify_hot_lead boolean default true,
  notify_stale_lead boolean default true,
  notify_warm_reply boolean default true,
  notify_inspection_request boolean default true,
  stale_lead_minutes integer default 15,
  delivery_push boolean default true,
  delivery_email boolean default true,
  delivery_sms boolean default false,
  price_template text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table agent_settings enable row level security;

create policy "Users can view own settings"
  on agent_settings for select using (auth.uid() = profile_id);
create policy "Users can insert own settings"
  on agent_settings for insert with check (auth.uid() = profile_id);
create policy "Users can update own settings"
  on agent_settings for update using (auth.uid() = profile_id);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  enquiry_id uuid references enquiries(id) on delete cascade,
  type text not null
    check (type in ('hot_lead', 'inspection_request', 'stale_lead', 'warm_reply')),
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_profile on notifications(profile_id);
create index idx_notifications_unread on notifications(profile_id, is_read) where is_read = false;

alter table notifications enable row level security;

create policy "Users can view own notifications"
  on notifications for select using (auth.uid() = profile_id);
create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = profile_id);
-- Service role inserts notifications via webhooks (bypasses RLS)

-- Add promotion_reason to enquiries
alter table enquiries add column promotion_reason text;

-- Enable realtime for notifications
alter publication supabase_realtime add table notifications;

-- Seed a "Demo Agency" org for testing
insert into organisations (name) values ('Demo Agency');
