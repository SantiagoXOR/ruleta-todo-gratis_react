// Configuración de la aplicación
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Configuración de caché
export const CACHE_DURATION = Number(import.meta.env.VITE_CACHE_DURATION) || 300000;

// Configuración de desarrollo
export const ENABLE_MOCK_API = import.meta.env.VITE_ENABLE_MOCK_API === 'true';
export const NODE_ENV = import.meta.env.NODE_ENV || 'development';
