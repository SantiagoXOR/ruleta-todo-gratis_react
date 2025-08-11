import { supabase } from '../lib/supabase';
import { ENABLE_MOCK_API } from '../config';

interface AuthError {
  message: string;
}

// Credenciales de demo para modo mock
const DEMO_CREDENTIALS = {
  email: 'admin@pintemas.com',
  password: 'demo123',
  user: {
    id: 'demo-user-id',
    email: 'admin@pintemas.com',
    role: 'admin',
    name: 'Administrador Demo'
  }
};

export const authService = {
  async login(email: string, password: string) {
    try {
      // Modo mock - usar credenciales demo
      if (ENABLE_MOCK_API) {
        console.log('Modo demo activado - usando credenciales mock');

        if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
          console.log('Login demo exitoso');
          return {
            user: DEMO_CREDENTIALS.user,
            session: { access_token: 'demo-token' }
          };
        } else {
          throw new Error('Credenciales incorrectas. Use: admin@pintemas.com / demo123');
        }
      }

      // Modo Supabase (cuando esté configurado)
      console.log('Intentando login con Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Respuesta de Supabase:', { data, error });

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(this.getErrorMessage(error));
      }

      return data;
    } catch (error) {
      console.error('Error en authService.login:', error);
      const message = this.getErrorMessage(error as AuthError);
      throw new Error(message);
    }
  },

  async logout() {
    try {
      if (ENABLE_MOCK_API) {
        console.log('Logout en modo demo');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem('isAuthenticated');
    } catch (error) {
      throw new Error('Error al cerrar sesión');
    }
  },

  async getCurrentUser() {
    try {
      console.log('Obteniendo usuario actual...');

      if (ENABLE_MOCK_API) {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
          console.log('Usuario demo actual:', DEMO_CREDENTIALS.user);
          return DEMO_CREDENTIALS.user;
        }
        return null;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Usuario actual:', user);
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },

  async isAuthenticated() {
    const user = await this.getCurrentUser();
    return !!user;
  },

  getErrorMessage(error: AuthError): string {
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Credenciales inválidas',
      'Email not confirmed': 'Email no confirmado',
      'Invalid email': 'Email inválido',
      'User not found': 'Usuario no encontrado',
    };

    return errorMessages[error.message] || 'Error al iniciar sesión';
  }
}; 