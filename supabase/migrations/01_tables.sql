-- Enable UUID extension
create extension
if not exists "uuid-ossp";

-- Create users table
create table
if not exists public.users
(
    id uuid references auth.users on
delete cascade primary key,
    created_at timestamptz
default now
() not null,
    email text not null unique,
    name text,
    avatar_url text,
    role text not null check
(role in
('user', 'admin')) default 'user'
);

-- Create prizes table
create table
if not exists public.prizes
(
    id uuid primary key default uuid_generate_v4
(),
    created_at timestamptz default now
() not null,
    name text not null,
    description text,
    probability numeric
(5,2) not null check
(probability >= 0 and probability <= 100),
    stock integer not null check
(stock >= 0),
    image_url text,
    is_active boolean not null default true
);

-- Create spins table
create table
if not exists public.spins
(
    id uuid primary key default uuid_generate_v4
(),
    created_at timestamptz default now
() not null,
    user_id uuid not null references public.users on
delete cascade,
    prize_id uuid
references public.prizes on
delete
set null
,
    result_angle numeric
(10,2) not null,
    is_winner boolean not null default false
);

-- Create claims table
create table
if not exists public.claims
(
    id uuid primary key default uuid_generate_v4
(),
    created_at timestamptz default now
() not null,
    spin_id uuid not null references public.spins on
delete cascade,
    user_id uuid
not null references public.users on
delete cascade,
    prize_id uuid
not null references public.prizes on
delete cascade,
    status text
not null check
(status in
('pending', 'completed', 'cancelled')) default 'pending',
    claimed_at timestamptz
); 