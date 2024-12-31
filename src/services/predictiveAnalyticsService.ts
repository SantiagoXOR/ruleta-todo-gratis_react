import { API_BASE_URL } from '../config';

export interface PredictionData {
  expectedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors: Array<{
    name: string;
    impact: number;
  }>;
}

export interface TrendAnalysis {
  historicalData: number[];
  prediction: number[];
  seasonality: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  correlations: {
    [factor: string]: number;
  };
}

export interface UserBehaviorPattern {
  segment: string;
  characteristics: {
    frequency: 'low' | 'medium' | 'high';
    preferences: string[];
  };
  predictedActions: Array<{
    action: string;
    probability: number;
  }>;
}

export interface OptimalTiming {
  bestTimes: string[];
  expectedParticipation: number;
  confidence: number;
}

export interface Recommendations {
  prizes: string[];
  timing: string[];
  preferences: {
    category: string;
    priceRange: string;
  };
}

export interface Anomaly {
  timestamp: string;
  value: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

class PredictiveAnalyticsService {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}/api/analytics/predictive${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }

    return response.json();
  }

  async getPrizePredictions(prizeId: string): Promise<PredictionData> {
    return this.fetchWithAuth(`/prizes/${prizeId}`);
  }

  async analyzeTrends(
    metric: string,
    startDate: Date,
    endDate: Date
  ): Promise<TrendAnalysis> {
    return this.fetchWithAuth('/trends', {
      method: 'POST',
      body: JSON.stringify({
        metric,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });
  }

  async getUserBehaviorPatterns(
    userId: string,
    timeframe: 'day' | 'week' | 'month'
  ): Promise<UserBehaviorPattern[]> {
    return this.fetchWithAuth('/user-behavior', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        timeframe,
      }),
    });
  }

  async getOptimalTiming(prizeId: string): Promise<OptimalTiming> {
    return this.fetchWithAuth(`/optimal-timing/${prizeId}`);
  }

  async getRecommendations(userId: string): Promise<Recommendations> {
    return this.fetchWithAuth(`/recommendations/${userId}`);
  }

  async detectAnomalies(
    metric: string,
    granularity: 'hour' | 'day' | 'week'
  ): Promise<{ anomalies: Anomaly[] }> {
    return this.fetchWithAuth('/anomalies', {
      method: 'POST',
      body: JSON.stringify({
        metric,
        granularity,
      }),
    });
  }

  async getMetricCorrelations(
    primaryMetric: string,
    secondaryMetrics: string[]
  ): Promise<{ [metric: string]: number }> {
    return this.fetchWithAuth('/correlations', {
      method: 'POST',
      body: JSON.stringify({
        primaryMetric,
        secondaryMetrics,
      }),
    });
  }

  async getForecastAccuracy(): Promise<{
    metric: string;
    accuracy: number;
    confidence: number;
  }[]> {
    return this.fetchWithAuth('/forecast-accuracy');
  }

  async getSeasonalityPatterns(
    metric: string,
    timeframe: 'daily' | 'weekly' | 'monthly'
  ): Promise<{
    patterns: number[];
    significance: number;
    confidence: number;
  }> {
    return this.fetchWithAuth('/seasonality', {
      method: 'POST',
      body: JSON.stringify({
        metric,
        timeframe,
      }),
    });
  }

  async getAnomalyThresholds(
    metric: string
  ): Promise<{
    low: number;
    medium: number;
    high: number;
  }> {
    return this.fetchWithAuth(`/anomaly-thresholds/${metric}`);
  }

  async updateAnomalyThresholds(
    metric: string,
    thresholds: {
      low: number;
      medium: number;
      high: number;
    }
  ): Promise<void> {
    await this.fetchWithAuth(`/anomaly-thresholds/${metric}`, {
      method: 'PUT',
      body: JSON.stringify(thresholds),
    });
  }

  async getModelPerformance(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }> {
    return this.fetchWithAuth('/model-performance');
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService(); 