-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.prizes enable row level security;
alter table public.spins enable row level security;
alter table public.claims enable row level security;

-- Drop existing policies if they exist
drop policy
if exists "Users can view their own profile" on public.users;
drop policy
if exists "Admins can manage all profiles" on public.users;
drop policy
if exists "Anyone can view active prizes" on public.prizes;
drop policy
if exists "Admins can manage prizes" on public.prizes;
drop policy
if exists "Users can view their own spins" on public.spins;
drop policy
if exists "Users can create their own spins" on public.spins;
drop policy
if exists "Admins can view all spins" on public.spins;
drop policy
if exists "Users can view their own claims" on public.claims;
drop policy
if exists "Users can create claims for their spins" on public.claims;
drop policy
if exists "Users can update their pending claims" on public.claims;
drop policy
if exists "Admins can manage all claims" on public.claims;

-- User policies
create policy "Users can view their own profile"
    on public.users for
select
  using (auth.uid() = id);

create policy "Admins can manage all profiles"
    on public.users for all
    using
(auth.jwt
() ->> 'role' = 'admin');

-- Prize policies
create policy "Anyone can view active prizes"
    on public.prizes for
select
  using (is_active = true);

create policy "Admins can manage prizes"
    on public.prizes for all
    using
(auth.jwt
() ->> 'role' = 'admin');

-- Spin policies
create policy "Users can view their own spins"
    on public.spins for
select
  using (auth.uid() = user_id);

create policy "Users can create their own spins"
    on public.spins for
insert
    with check (auth.uid() =
user_id);

create policy "Admins can view all spins"
    on public.spins for
select
  using (auth.jwt() ->> 'role' = 'admin');

-- Claim policies
create policy "Users can view their own claims"
    on public.claims for
select
  using (auth.uid() = user_id);

create policy "Users can create claims for their spins"
    on public.claims for
insert
    with check (
        auth.uid() =
user_id
and
exists
(
            select 1
from public.spins
where spins.id = spin_id
  and spins.user_id = auth.uid()
        )
);

create policy "Users can update their pending claims"
    on public.claims for
update
    using (
        auth.uid()
= user_id and
        status = 'pending'
    );

create policy "Admins can manage all claims"
    on public.claims for all
    using
(auth.jwt
() ->> 'role' = 'admin'); 