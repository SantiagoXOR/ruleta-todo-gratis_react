import { PrizeWithCode } from '../types/wheel.types';

export interface PrizeStats {
  totalPrizes: number;
  claimedPrizes: number;
  pendingPrizes: number;
  expiringToday: number;
  expiredPrizes: number;
  redemptionRate: number;
}

export interface PrizeDistribution {
  name: string;
  count: number;
  percentage: number;
  claimed: number;
  pending: number;
}

export interface TimeStats {
  date: string;
  total: number;
  claimed: number;
}

export interface StatsResponse {
  success: boolean;
  message: string;
  stats?: PrizeStats;
  distribution?: PrizeDistribution[];
  timeStats?: TimeStats[];
}

export interface StatsFilter {
  startDate?: Date;
  endDate?: Date;
  storeId?: string;
}

class PrizeStatsService {
  private readonly API_URL = '/api/prizes/stats';

  async getGeneralStats(filter: StatsFilter = {}): Promise<StatsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter.startDate) {
        queryParams.append('startDate', filter.startDate.toISOString());
      }
      if (filter.endDate) {
        queryParams.append('endDate', filter.endDate.toISOString());
      }
      if (filter.storeId) {
        queryParams.append('storeId', filter.storeId);
      }

      const url = `${this.API_URL}/general?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al obtener las estadísticas');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        stats: data.stats,
        distribution: data.distribution,
        timeStats: data.timeStats
      };
    } catch (error) {
      console.error('Error fetching prize stats:', error);
      return {
        success: false,
        message: 'Error al obtener las estadísticas'
      };
    }
  }

  async getTimeSeriesStats(filter: StatsFilter = {}): Promise<StatsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter.startDate) {
        queryParams.append('startDate', filter.startDate.toISOString());
      }
      if (filter.endDate) {
        queryParams.append('endDate', filter.endDate.toISOString());
      }
      if (filter.storeId) {
        queryParams.append('storeId', filter.storeId);
      }

      const url = `${this.API_URL}/timeseries?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al obtener las estadísticas temporales');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Estadísticas temporales obtenidas exitosamente',
        timeStats: data.timeStats
      };
    } catch (error) {
      console.error('Error fetching time series stats:', error);
      return {
        success: false,
        message: 'Error al obtener las estadísticas temporales'
      };
    }
  }

  async getPrizeDistribution(filter: StatsFilter = {}): Promise<StatsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter.startDate) {
        queryParams.append('startDate', filter.startDate.toISOString());
      }
      if (filter.endDate) {
        queryParams.append('endDate', filter.endDate.toISOString());
      }
      if (filter.storeId) {
        queryParams.append('storeId', filter.storeId);
      }

      const url = `${this.API_URL}/distribution?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al obtener la distribución de premios');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Distribución de premios obtenida exitosamente',
        distribution: data.distribution
      };
    } catch (error) {
      console.error('Error fetching prize distribution:', error);
      return {
        success: false,
        message: 'Error al obtener la distribución de premios'
      };
    }
  }

  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
}

export const prizeStatsService = new PrizeStatsService();

// Exportar funciones individuales para compatibilidad
export const getGeneralStats = (filter?: StatsFilter) => prizeStatsService.getGeneralStats(filter);
export const getTimeSeriesStats = (filter?: StatsFilter) => prizeStatsService.getTimeSeriesStats(filter);
export const getPrizeDistribution = (filter?: StatsFilter) => prizeStatsService.getPrizeDistribution(filter);