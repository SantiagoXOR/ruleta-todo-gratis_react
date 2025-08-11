import { API_BASE_URL, ENABLE_MOCK_API } from '../config';

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

// Datos mock para análisis predictivo
const MOCK_PREDICTION_DATA: PredictionData = {
  expectedValue: 85.6,
  confidence: 0.87,
  trend: 'up',
  factors: [
    { name: 'Hora del día', impact: 0.34 },
    { name: 'Día de la semana', impact: 0.28 },
    { name: 'Promociones activas', impact: 0.23 },
    { name: 'Clima', impact: 0.15 }
  ]
};

const MOCK_TREND_ANALYSIS: TrendAnalysis = {
  historicalData: [45, 52, 48, 61, 58, 67, 72, 69, 74, 81],
  prediction: [78, 82, 85, 88, 91, 94, 97],
  seasonality: {
    daily: [0.8, 0.6, 0.4, 0.3, 0.5, 0.9, 1.2, 1.5, 1.3, 1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 1.0, 1.2, 1.4, 1.6, 1.5, 1.3, 1.1, 1.0, 0.9],
    weekly: [1.0, 1.1, 1.2, 1.3, 1.4, 1.6, 1.5],
    monthly: [0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.1, 1.0, 0.95, 0.9, 0.85]
  },
  correlations: {
    'temperatura': 0.65,
    'promociones': 0.78,
    'fin_de_semana': 0.45,
    'eventos_especiales': 0.82
  }
};

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
    if (ENABLE_MOCK_API) {
      console.log('Usando datos mock para predicciones de premios');
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_PREDICTION_DATA;
    }
    return this.fetchWithAuth(`/prizes/${prizeId}`);
  }

  async analyzeTrends(
    metric: string,
    startDate: Date,
    endDate: Date
  ): Promise<TrendAnalysis> {
    if (ENABLE_MOCK_API) {
      console.log('Usando datos mock para análisis de tendencias');
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_TREND_ANALYSIS;
    }
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