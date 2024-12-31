import { supabase } from '../lib/supabase';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPrizes: number;
  claimedPrizes: number;
  totalStores: number;
  activeStores: number;
  revenue: number;
  conversionRate: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  name: string;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  permissions: string[];
}

export interface Store {
  id: string;
  name: string;
  active: boolean;
  location: string;
  manager: string;
  createdAt: Date;
  prizeConfig: {
    maxPrizesPerDay: number;
    maxPrizesPerUser: number;
    expirationDays: number;
  };
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userEmail: string;
  timestamp: Date;
  details: any;
  ip: string;
  userAgent: string;
}

class AdminService {
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Por ahora retornamos datos de ejemplo
      return {
        totalUsers: 100,
        activeUsers: 75,
        totalPrizes: 500,
        claimedPrizes: 350,
        totalStores: 10,
        activeStores: 8,
        revenue: 15000,
        conversionRate: 70
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getUsers(filters?: {
    role?: string;
    active?: boolean;
    search?: string;
  }): Promise<AdminUser[]> {
    try {
      // Por ahora retornamos datos de ejemplo
      return [
        {
          id: '1',
          email: 'admin@pintemas.com',
          role: 'admin',
          name: 'Administrador',
          active: true,
          lastLogin: new Date(),
          createdAt: new Date(),
          permissions: ['all']
        },
        {
          id: '2',
          email: 'manager@pintemas.com',
          role: 'manager',
          name: 'Gerente',
          active: true,
          lastLogin: new Date(),
          createdAt: new Date(),
          permissions: ['manage_store']
        }
      ];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      // Implementar actualización de usuario en Supabase
      console.log('Actualizando usuario:', userId, updates);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getStores(filters?: {
    active?: boolean;
    search?: string;
  }): Promise<Store[]> {
    try {
      // Por ahora retornamos datos de ejemplo
      return [
        {
          id: '1',
          name: 'Tienda Central',
          active: true,
          location: 'Centro Comercial',
          manager: 'Juan Pérez',
          createdAt: new Date(),
          prizeConfig: {
            maxPrizesPerDay: 100,
            maxPrizesPerUser: 1,
            expirationDays: 7
          }
        },
        {
          id: '2',
          name: 'Tienda Norte',
          active: true,
          location: 'Zona Norte',
          manager: 'María García',
          createdAt: new Date(),
          prizeConfig: {
            maxPrizesPerDay: 50,
            maxPrizesPerUser: 1,
            expirationDays: 7
          }
        }
      ];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async updateStore(storeId: string, updates: Partial<Store>): Promise<void> {
    try {
      // Implementar actualización de tienda en Supabase
      console.log('Actualizando tienda:', storeId, updates);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async createStore(store: Omit<Store, 'id' | 'createdAt'>): Promise<Store> {
    try {
      // Implementar creación de tienda en Supabase
      console.log('Creando tienda:', store);
      return {
        ...store,
        id: '3',
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]> {
    try {
      // Por ahora retornamos datos de ejemplo
      return [
        {
          id: '1',
          action: 'Login',
          userId: '1',
          userEmail: 'admin@pintemas.com',
          timestamp: new Date(),
          details: { ip: '192.168.1.1' },
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        },
        {
          id: '2',
          action: 'Premio reclamado',
          userId: '2',
          userEmail: 'manager@pintemas.com',
          timestamp: new Date(),
          details: { prizeId: '123' },
          ip: '192.168.1.2',
          userAgent: 'Mozilla/5.0'
        }
      ];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async generateReport(type: 'users' | 'prizes' | 'stores', format: 'csv' | 'excel' | 'pdf'): Promise<Blob> {
    try {
      // Por ahora retornamos un blob vacío
      return new Blob(['Datos del reporte'], { type: 'text/plain' });
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService(); 