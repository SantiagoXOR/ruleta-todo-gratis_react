import { PrizeWithCode } from '../types/wheel.types';

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
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas de administración');
      }

      return await response.json();
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
      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`/api/admin/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }
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
      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`/api/admin/stores?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener tiendas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async updateStore(storeId: string, updates: Partial<Store>): Promise<void> {
    try {
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar tienda');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async createStore(store: Omit<Store, 'id' | 'createdAt'>): Promise<Store> {
    try {
      const response = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(store)
      });

      if (!response.ok) {
        throw new Error('Error al crear tienda');
      }

      return await response.json();
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
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            if (value instanceof Date) {
              queryParams.append(key, value.toISOString());
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`/api/admin/audit-logs?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener logs de auditoría');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getPrizeConfiguration(storeId: string): Promise<Store['prizeConfig']> {
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/prize-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener configuración de premios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async updatePrizeConfiguration(
    storeId: string,
    config: Partial<Store['prizeConfig']>
  ): Promise<void> {
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/prize-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar configuración de premios');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async invalidatePrize(prizeId: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/prizes/${prizeId}/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Error al invalidar premio');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async generateReport(type: 'users' | 'prizes' | 'stores', format: 'csv' | 'excel' | 'pdf'): Promise<Blob> {
    try {
      const response = await fetch(`/api/admin/reports/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format })
      });

      if (!response.ok) {
        throw new Error('Error al generar reporte');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService(); 