-- Habilitar la extensión UUID
CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";

-- Configurar el esquema de seguridad
ALTER DATABASE postgres SET "auth.jwt.claims.email.key"
TO 'email';

-- Tabla de usuarios (extiende auth.users)
CREATE TABLE
IF NOT EXISTS public.users
(
  id UUID PRIMARY KEY REFERENCES auth.users
(id) ON
DELETE CASCADE,
  created_at TIMESTAMP
WITH TIME ZONE DEFAULT TIMEZONE
('utc'::text, NOW
()) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK
(role IN
('user', 'admin')) NOT NULL
);

-- Tabla de premios
CREATE TABLE
IF NOT EXISTS public.prizes
(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
  created_at TIMESTAMP
WITH TIME ZONE DEFAULT TIMEZONE
('utc'::text, NOW
()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  probability NUMERIC
(5,2) NOT NULL CHECK
(probability >= 0 AND probability <= 100),
  stock INTEGER NOT NULL CHECK
(stock >= 0),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Tabla de giros
CREATE TABLE
IF NOT EXISTS public.spins
(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
  created_at TIMESTAMP
WITH TIME ZONE DEFAULT TIMEZONE
('utc'::text, NOW
()) NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users
(id) ON
DELETE CASCADE,
  prize_id UUID
REFERENCES public.prizes
(id) ON
DELETE
SET NULL
,
  result_angle NUMERIC
(10,2) NOT NULL,
  is_winner BOOLEAN DEFAULT false NOT NULL
);

-- Tabla de reclamaciones
CREATE TABLE
IF NOT EXISTS public.claims
(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4
(),
  created_at TIMESTAMP
WITH TIME ZONE DEFAULT TIMEZONE
('utc'::text, NOW
()) NOT NULL,
  spin_id UUID NOT NULL REFERENCES public.spins
(id) ON
DELETE CASCADE,
  user_id UUID
NOT NULL REFERENCES public.users
(id) ON
DELETE CASCADE,
  prize_id UUID
NOT NULL REFERENCES public.prizes
(id) ON
DELETE CASCADE,
  status TEXT
DEFAULT 'pending' CHECK
(status IN
('pending', 'completed', 'cancelled')) NOT NULL,
  claimed_at TIMESTAMP
WITH TIME ZONE
);

-- Función para decrementar el stock de premios
CREATE OR REPLACE FUNCTION public.decrement_prize_stock
(prize_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.prizes
  SET stock = stock - 1
  WHERE id = prize_id
    AND stock > 0;
  RETURN FOUND;
END;
$$;

-- Políticas de Seguridad (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR
SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.users
  FOR ALL
  USING
(auth.jwt
() ->> 'role' = 'admin');

-- Políticas para premios
CREATE POLICY "Anyone can view active prizes"
  ON public.prizes
  FOR
SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage prizes"
  ON public.prizes
  FOR ALL
  USING
(auth.jwt
() ->> 'role' = 'admin');

-- Políticas para giros
CREATE POLICY "Users can view their own spins"
  ON public.spins
  FOR
SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spins"
  ON public.spins
  FOR
INSERT
  WITH CHECK (auth.uid() =
user_id);

CREATE POLICY "Admins can view all spins"
  ON public.spins
  FOR
SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para reclamaciones
CREATE POLICY "Users can view their own claims"
  ON public.claims
  FOR
SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims for their spins"
  ON public.claims
  FOR
INSERT
  WITH CHECK (
    auth.uid() =
user_id
AND
EXISTS
(
      SELECT 1
FROM public.spins
WHERE spins.id = spin_id
  AND spins.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their pending claims"
  ON public.claims
  FOR
UPDATE
  USING (
    auth.uid()
= user_id AND
    status = 'pending'
  );

CREATE POLICY "Admins can manage all claims"
  ON public.claims
  FOR ALL
  USING
(auth.jwt
() ->> 'role' = 'admin');

-- Índices para mejor rendimiento
CREATE INDEX
IF NOT EXISTS idx_spins_user_id ON public.spins
(user_id);
CREATE INDEX
IF NOT EXISTS idx_spins_prize_id ON public.spins
(prize_id);
CREATE INDEX
IF NOT EXISTS idx_claims_user_id ON public.claims
(user_id);
CREATE INDEX
IF NOT EXISTS idx_claims_spin_id ON public.claims
(spin_id);
CREATE INDEX
IF NOT EXISTS idx_claims_prize_id ON public.claims
(prize_id);
CREATE INDEX
IF NOT EXISTS idx_claims_status ON public.claims
(status);

-- Triggers para mantener la integridad de los datos
CREATE OR REPLACE FUNCTION check_prize_availability
()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_winner = true THEN
  -- Verificar que el premio existe y tiene stock
  IF NOT EXISTS (
      SELECT 1
  FROM public.prizes
  WHERE id = NEW.prize_id
    AND stock > 0
    AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Premio no disponible o sin stock';
END
IF;
    
    -- Decrementar el stock
    UPDATE public.prizes
    SET stock = stock - 1
    WHERE id = NEW.prize_id;
END
IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_prize_before_spin
  BEFORE
INSERT ON public.
spins
FOR
EACH
ROW
EXECUTE FUNCTION check_prize_availability
(); 