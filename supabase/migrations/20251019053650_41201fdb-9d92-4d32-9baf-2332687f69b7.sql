-- Create user_roles table for proper role management (CRITICAL SECURITY FIX)
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role),
  created_at timestamp with time zone default now()
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles without RLS recursion
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Insert owner and admin roles for existing owner accounts
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role
from auth.users
where email in ('von357336@gmail.com', 'diddy@gmail.com')
on conflict (user_id, role) do nothing;

-- RLS policies for user_roles
create policy "Users can view their own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles
for select
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
on public.user_roles
for all
using (public.has_role(auth.uid(), 'admin'));

-- Update profiles trigger to assign default user role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile
  insert into public.profiles (id, email, token_balance, plan, is_owner)
  values (
    new.id, 
    new.email,
    1000000,
    'free',
    new.email in ('von357336@gmail.com', 'diddy@gmail.com')
  );
  
  -- Assign roles
  if new.email in ('von357336@gmail.com', 'diddy@gmail.com') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  
  return new;
end;
$$;

-- Add function for users to redeem premium keys
create or replace function public.redeem_premium_key(_key_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key record;
  v_result json;
begin
  -- Find and lock the key
  select * into v_key
  from premium_keys
  where key_code = _key_code
  and is_used = false
  for update;
  
  if not found then
    return json_build_object('success', false, 'message', 'Invalid or already used key');
  end if;
  
  -- Update user profile
  update profiles
  set plan = v_key.plan,
      updated_at = now()
  where id = auth.uid();
  
  -- Mark key as used
  update premium_keys
  set is_used = true,
      used_by = auth.uid(),
      used_at = now()
  where id = v_key.id;
  
  return json_build_object('success', true, 'message', 'Premium key redeemed successfully!', 'plan', v_key.plan);
end;
$$;