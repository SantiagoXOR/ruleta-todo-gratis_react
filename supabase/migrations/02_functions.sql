-- Function to decrement prize stock
create or replace function public.decrement_prize_stock
(prize_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.prizes
  set stock = stock - 1
  where id = prize_id
    and stock > 0;
  return found;
end;
$$;

-- Function to check prize availability before spin
create or replace function public.check_prize_availability
()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.is_winner = true then
  -- Check if prize exists and has stock
  if not exists (
      select 1
  from public.prizes
  where id = new.prize_id
    and stock > 0
    and is_active = true
    ) then
      raise exception 'Premio no disponible o sin stock';
end
if;
    
    -- Decrement stock
    update public.prizes
    set stock = stock - 1
    where id = new.prize_id;
end
if;
  
  return new;
end;
$$;

-- Create trigger for prize availability check
drop trigger if exists check_prize_before_spin
on public.spins;
create trigger check_prize_before_spin
  before
insert on public.
spins
for
each
row
execute
function public.check_prize_availability
(); 