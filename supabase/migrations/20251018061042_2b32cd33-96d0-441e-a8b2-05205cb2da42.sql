-- Create enum types
create type public.environment_type as enum ('dev', 'staging', 'prod');
create type public.deploy_status_type as enum ('pending', 'live', 'error', 'archived');
create type public.security_scan_status_type as enum ('not_run', 'safe', 'issues_found');
create type public.plan_type as enum ('free', 'premium', 'ultra');
create type public.mode_type as enum ('chat', 'agent');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  token_balance bigint not null default 1000000,
  token_consumed bigint not null default 0,
  plan plan_type not null default 'free',
  selected_character text,
  is_admin boolean not null default false,
  is_owner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create projects table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  environment environment_type not null default 'dev',
  database_url text,
  github_repo text,
  custom_domain text,
  mode mode_type not null default 'chat',
  deploy_status deploy_status_type not null default 'pending',
  security_scan_status security_scan_status_type not null default 'not_run',
  resource_limits jsonb default '{"cpu": 1, "memory": 512, "requests_per_hour": 1000}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create project_collaborators table
create table public.project_collaborators (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'viewer',
  created_at timestamptz not null default now(),
  unique(project_id, user_id)
);

-- Create premium_keys table
create table public.premium_keys (
  id uuid primary key default gen_random_uuid(),
  key_code text unique not null,
  plan plan_type not null,
  is_used boolean not null default false,
  used_by uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

-- Create docs_comments table
create table public.docs_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  section_id text not null,
  comment_text text not null,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_collaborators enable row level security;
alter table public.premium_keys enable row level security;
alter table public.docs_comments enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Projects policies
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Project collaborators policies
create policy "Users can view collaborators on their projects"
  on public.project_collaborators for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_collaborators.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Premium keys policies (admin/owner only)
create policy "Admins can view all premium keys"
  on public.premium_keys for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (profiles.is_admin = true or profiles.is_owner = true)
    )
  );

create policy "Admins can create premium keys"
  on public.premium_keys for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (profiles.is_admin = true or profiles.is_owner = true)
    )
  );

-- Docs comments policies
create policy "Everyone can view approved comments"
  on public.docs_comments for select
  using (is_approved = true);

create policy "Users can create comments"
  on public.docs_comments for insert
  with check (auth.uid() = user_id);

create policy "Admins can update comments"
  on public.docs_comments for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and (profiles.is_admin = true or profiles.is_owner = true)
    )
  );

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, token_balance, plan, is_owner)
  values (
    new.id, 
    new.email,
    1000000,
    'free',
    new.email in ('von357336@gmail.com', 'diddy@gmail.com')
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add update triggers
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at_column();

create trigger update_docs_comments_updated_at
  before update on public.docs_comments
  for each row execute function public.update_updated_at_column();