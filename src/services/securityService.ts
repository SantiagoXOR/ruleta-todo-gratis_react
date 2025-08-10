import { AdminUser } from './adminService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}

export interface SecurityConfig {
  maxLoginAttempts: number;
  sessionTimeout: number;
  requireTwoFactor: boolean;
}

class SecurityService {
  private token: string | null = null;
  private currentUser: AdminUser | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Error de autenticación');
      }

      const data = await response.json();
      this.token = data.token;
      this.currentUser = data.user;
      this.setupAuthInterceptor();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      this.clearAuth();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al refrescar el token');
      }

      const data = await response.json();
      this.token = data.token;
      return data.token;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async validatePermission(permission: string): Promise<boolean> {
    if (!this.currentUser) {
      return false;
    }

    return this.currentUser.permissions.includes(permission);
  }

  async getSecurityConfig(): Promise<SecurityConfig> {
    try {
      const response = await fetch('/api/auth/config', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener la configuración de seguridad');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async updateSecurityConfig(config: Partial<SecurityConfig>): Promise<void> {
    try {
      const response = await fetch('/api/auth/config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la configuración de seguridad');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Error al solicitar el restablecimiento de contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async validateResetToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/auth/validate-reset-token/${token}`, {
        method: 'GET'
      });

      return response.ok;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        throw new Error('Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): AdminUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  private clearAuth(): void {
    this.token = null;
    this.currentUser = null;
  }

  private setupAuthInterceptor(): void {
    // Configurar interceptor para añadir el token a todas las peticiones
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        init = init || {};
        init.headers = {
          ...init.headers,
          'Authorization': `Bearer ${this.token}`
        };
      }
      return originalFetch(input, init);
    };
  }
}

export const securityService = new SecurityService(); 