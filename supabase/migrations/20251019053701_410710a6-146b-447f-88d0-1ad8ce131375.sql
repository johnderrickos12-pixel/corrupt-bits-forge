-- Fix function search_path for all functions to be immutable
alter function public.has_role(_user_id uuid, _role app_role) set search_path = public;
alter function public.handle_new_user() set search_path = public;
alter function public.redeem_premium_key(_key_code text) set search_path = public;
alter function public.update_updated_at_column() set search_path = public;