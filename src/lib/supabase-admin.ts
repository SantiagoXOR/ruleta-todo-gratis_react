import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '../config';

// Cliente de Supabase con privilegios de administrador
const supabaseUrl = SUPABASE_URL;
const supabaseServiceKey = SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan las credenciales de administrador de Supabase');
}

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
); 