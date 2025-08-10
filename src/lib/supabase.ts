import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las credenciales de Supabase');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Tipos de ayuda para usar en los servicios
export type Tables = Database['public']['Tables'];
export type UserRow = Tables['users']['Row'];
export type PrizeRow = Tables['prizes']['Row'];
export type SpinRow = Tables['spins']['Row'];
export type ClaimRow = Tables['claims']['Row']; 