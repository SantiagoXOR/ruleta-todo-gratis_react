import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmybmkqbxzqviqaoyqoc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teWJta3FieHpxdmlxYW95cW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NzYxNzksImV4cCI6MjA1MDQ1MjE3OX0.VXUFEk8oKiH_bXhxNDquJ4LTOmW9gjFnHWZtFAgbG6I';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las credenciales de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 