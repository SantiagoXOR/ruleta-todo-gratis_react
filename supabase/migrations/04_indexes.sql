-- Drop existing indexes if they exist
drop index if exists public.idx_spins_user_id;
drop index if exists public.idx_spins_prize_id;
drop index if exists public.idx_claims_user_id;
drop index if exists public.idx_claims_spin_id;
drop index if exists public.idx_claims_prize_id;
drop index if exists public.idx_claims_status;

-- Create indexes for better performance
create index idx_spins_user_id on public.spins(user_id);
create index idx_spins_prize_id on public.spins(prize_id);
create index idx_claims_user_id on public.claims(user_id);
create index idx_claims_spin_id on public.claims(spin_id);
create index idx_claims_prize_id on public.claims(prize_id);
create index idx_claims_status on public.claims(status); 