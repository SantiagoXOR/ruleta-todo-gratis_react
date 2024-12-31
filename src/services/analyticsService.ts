import { PrizeWithCode } from '../types/wheel.types';

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