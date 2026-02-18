-- Users / Agents
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  agency_name text,
  avatar_url text,
  ai_messaging_mode text default 'draft' check (ai_messaging_mode in ('draft', 'safe', 'full')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Contacts (clients/leads)
create table contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  created_at timestamptz default now(),
  unique(profile_id, email)
);

-- Enquiries (conversations)
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  contact_id uuid references contacts(id) on delete cascade not null,
  channel text not null default 'email',
  subject text,
  temperature text not null default 'cold' check (temperature in ('hot', 'warm', 'cold')),
  property_address text,
  property_price_guide text,
  property_status text default 'available',
  is_read boolean default false,
  last_activity_at timestamptz default now(),
  call_brief jsonb,
  created_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references enquiries(id) on delete cascade not null,
  sender text not null check (sender in ('client', 'ai', 'agent')),
  content text not null,
  channel text not null default 'email',
  status text default 'sent' check (status in ('pending_approval', 'sent', 'edited', 'failed')),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index idx_enquiries_profile on enquiries(profile_id);
create index idx_enquiries_temperature on enquiries(temperature);
create index idx_enquiries_last_activity on enquiries(last_activity_at desc);
create index idx_messages_enquiry on messages(enquiry_id);
create index idx_messages_created on messages(created_at);
create index idx_contacts_profile_email on contacts(profile_id, email);

-- Row Level Security
alter table profiles enable row level security;
alter table contacts enable row level security;
alter table enquiries enable row level security;
alter table messages enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can view own contacts"
  on contacts for select using (auth.uid() = profile_id);
create policy "Users can insert own contacts"
  on contacts for insert with check (auth.uid() = profile_id);

create policy "Users can view own enquiries"
  on enquiries for select using (auth.uid() = profile_id);
create policy "Users can update own enquiries"
  on enquiries for update using (auth.uid() = profile_id);
create policy "Users can insert own enquiries"
  on enquiries for insert with check (auth.uid() = profile_id);

create policy "Users can view messages in own enquiries"
  on messages for select using (
    exists (select 1 from enquiries where enquiries.id = messages.enquiry_id and enquiries.profile_id = auth.uid())
  );
create policy "Users can insert messages in own enquiries"
  on messages for insert with check (
    exists (select 1 from enquiries where enquiries.id = messages.enquiry_id and enquiries.profile_id = auth.uid())
  );
create policy "Users can update messages in own enquiries"
  on messages for update using (
    exists (select 1 from enquiries where enquiries.id = messages.enquiry_id and enquiries.profile_id = auth.uid())
  );

-- Enable Realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table enquiries;
