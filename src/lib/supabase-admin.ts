import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '../config';

// Cliente de Supabase con privilegios de administrador
const supabaseUrl = SUPABASE_URL || 'https://mock.supabase.co';
const supabaseServiceKey = SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key';

// Solo mostrar warning en desarrollo, no lanzar error en producción
if ((!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ Usando credenciales mock de Supabase Admin. Configura VITE_SUPABASE_URL y VITE_SUPABASE_SERVICE_ROLE_KEY para funcionalidad completa.');
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