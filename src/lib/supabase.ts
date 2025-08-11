import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

const supabaseUrl = SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = SUPABASE_ANON_KEY || 'mock-anon-key';

// Solo mostrar warning en desarrollo, no lanzar error en producción
if ((!SUPABASE_URL || !SUPABASE_ANON_KEY) && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ Usando credenciales mock de Supabase. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para funcionalidad completa.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Tipos de ayuda para usar en los servicios
export type Tables = Database['public']['Tables'];
export type UserRow = Tables['users']['Row'];
export type PrizeRow = Tables['prizes']['Row'];
export type SpinRow = Tables['spins']['Row'];
export type ClaimRow = Tables['claims']['Row']; 