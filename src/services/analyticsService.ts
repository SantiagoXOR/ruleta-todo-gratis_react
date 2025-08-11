import { PrizeWithCode } from '../types/wheel.types';
import { ENABLE_MOCK_API } from '../config';

export interface AnalyticsData {
  totalSpins: number;
  totalPrizesWon: number;
  totalPrizesClaimed: number;
  averageClaimTime: number;
  prizeDistribution: {
    [key: string]: {
      count: number;
      percentage: number;
    };
  };
  timeSeriesData: {
    date: string;
    spins: number;
    prizes: number;
    claims: number;
  }[];
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    returnRate: number;
  };
  performanceMetrics: {
    averageLoadTime: number;
    errorRate: number;
    successRate: number;
  };
}

// Datos mock para modo demo
const MOCK_ANALYTICS_DATA: AnalyticsData = {
  totalSpins: 1247,
  totalPrizesWon: 892,
  totalPrizesClaimed: 734,
  averageClaimTime: 2.5,
  prizeDistribution: {
    'TODO GRATIS': { count: 156, percentage: 17.5 },
    '5% DESCUENTO': { count: 234, percentage: 26.2 },
    '10% DESCUENTO': { count: 178, percentage: 20.0 },
    'BONO EXTRA': { count: 134, percentage: 15.0 },
    '15% DESCUENTO': { count: 112, percentage: 12.6 },
    'KIT DE PINTURA': { count: 78, percentage: 8.7 }
  },
  timeSeriesData: [
    { date: '2024-01-01', spins: 45, prizes: 32, claims: 28 },
    { date: '2024-01-02', spins: 52, prizes: 38, claims: 31 },
    { date: '2024-01-03', spins: 48, prizes: 35, claims: 29 },
    { date: '2024-01-04', spins: 61, prizes: 44, claims: 37 },
    { date: '2024-01-05', spins: 58, prizes: 41, claims: 34 },
    { date: '2024-01-06', spins: 67, prizes: 48, claims: 42 },
    { date: '2024-01-07', spins: 72, prizes: 52, claims: 45 }
  ],
  userEngagement: {
    dailyActiveUsers: 156,
    weeklyActiveUsers: 892,
    monthlyActiveUsers: 2847,
    returnRate: 68.5
  },
  performanceMetrics: {
    averageLoadTime: 1.2,
    errorRate: 0.8,
    successRate: 99.2
  }
};

class AnalyticsService {
  private async fetchAnalytics(endpoint: string, params?: Record<string, any>): Promise<any> {
    try {
      const queryParams = params ? new URLSearchParams(params).toString() : '';
      const url = `/api/analytics/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos analíticos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getGeneralAnalytics(startDate?: Date, endDate?: Date): Promise<AnalyticsData> {
    if (ENABLE_MOCK_API) {
      console.log('Usando datos mock para analytics generales');
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_ANALYTICS_DATA;
    }

    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    return this.fetchAnalytics('general', params);
  }

  async getPrizeAnalytics(prizeId: string): Promise<{
    totalWins: number;
    claimRate: number;
    averageClaimTime: number;
    popularityTrend: number[];
  }> {
    return this.fetchAnalytics(`prizes/${prizeId}`);
  }

  async getUserAnalytics(userId: string): Promise<{
    totalSpins: number;
    prizesWon: number;
    favoriteTime: string;
    engagementScore: number;
  }> {
    return this.fetchAnalytics(`users/${userId}`);
  }

  async getTimeSeriesData(
    metric: 'spins' | 'prizes' | 'claims',
    interval: 'hour' | 'day' | 'week' | 'month',
    startDate: Date,
    endDate: Date
  ): Promise<{
    labels: string[];
    data: number[];
  }> {
    return this.fetchAnalytics('timeseries', {
      metric,
      interval,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }

  async getPerformanceMetrics(): Promise<{
    loadTimes: number[];
    errorRates: number[];
    successRates: number[];
  }> {
    return this.fetchAnalytics('performance');
  }

  async trackEvent(eventName: string, data: Record<string, any>): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          timestamp: new Date().toISOString(),
          data
        })
      });
    } catch (error) {
      console.error('Error al registrar evento:', error);
    }
  }

  async generateReport(
    type: 'general' | 'prizes' | 'users' | 'performance',
    format: 'pdf' | 'xlsx' | 'csv',
    filters?: Record<string, any>
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({
        type,
        format,
        ...filters
      }).toString();

      const response = await fetch(`/api/analytics/reports?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
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

  async getPredictions(prizeId: string): Promise<{
    expectedClaimRate: number;
    popularityForecast: number[];
    bestTimeToPromote: string;
  }> {
    return this.fetchAnalytics(`predictions/${prizeId}`);
  }
}

export const analyticsService = new AnalyticsService();