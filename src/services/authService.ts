import { supabase } from '../lib/supabase';

interface AuthError {
  message: string;
}

export const authService = {
  async login(email: string, password: string) {
    try {
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