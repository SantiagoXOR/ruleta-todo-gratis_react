import { predictiveAnalyticsService } from '../predictiveAnalyticsService';

// Mock de fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('PredictiveAnalyticsService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getPrizePredictions', () => {
    it('debería obtener predicciones correctamente', async () => {
      const mockData = {
        expectedValue: 100,
        confidence: 0.85,
        trend: 'up' as const,
        factors: [
          { name: 'Temporada', impact: 0.7 },
          { name: 'Día de la semana', impact: 0.3 }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await predictiveAnalyticsService.getPrizePredictions('prize-123');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/predictive/prizes/prize-123'),
        expect.any(Object)
      );
    });

    it('debería manejar errores correctamente', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error de red'));

      await expect(predictiveAnalyticsService.getPrizePredictions('prize-123')).rejects.toThrow();
    });
  });

  describe('analyzeTrends', () => {
    it('debería analizar tendencias correctamente', async () => {
      const mockData = {
        historicalData: [10, 20, 30],
        prediction: [35, 40, 45],
        seasonality: {
          daily: [1, 2, 3, 4, 5, 6, 7],
          weekly: [10, 15, 20, 25, 30, 35, 40],
          monthly: [100, 110, 120, 130]
        },
        correlations: {
          'Temperatura': 0.8,
          'Precipitación': -0.3
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await predictiveAnalyticsService.analyzeTrends(
        'participation',
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/predictive/trends'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String)
        })
      );
    });
  });

  describe('getUserBehaviorPatterns', () => {
    it('debería obtener patrones de comportamiento correctamente', async () => {
      const mockData = [{
        segment: 'Usuarios frecuentes',
        characteristics: {
          frequency: 'high',
          preferences: ['electronics', 'games']
        },
        predictedActions: [
          { action: 'claim', probability: 0.8 },
          { action: 'share', probability: 0.6 }
        ]
      }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await predictiveAnalyticsService.getUserBehaviorPatterns(
        'user-123',
        'week'
      );

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/predictive/user-behavior'),
        expect.any(Object)
      );
    });
  });

  describe('getOptimalTiming', () => {
    it('debería obtener timing óptimo correctamente', async () => {
      const mockData = {
        bestTimes: ['10:00', '15:00', '19:00'],
        expectedParticipation: 150,
        confidence: 0.9
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await predictiveAnalyticsService.getOptimalTiming('prize-123');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/predictive/optimal-timing/prize-123'),
        expect.any(Object)
      );
    });
  });

  describe('getRecommendations', () => {
    it('debería obtener recomendaciones correctamente', async () => {
      const mockData = {
        prizes: ['prize-1', 'prize-2'],
        timing: ['morning', 'evening'],
        preferences: {
          category: 'electronics',
          priceRange: 'medium'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await predictiveAnalyticsService.getRecommendations('user-123');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/predictive/recommendations/user-123'),
        expect.any(Object)
      );
    });
  });

  describe('detectAnomalies', () => {
    it('debería detectar anomalías correctamente', async () => {
      const mockData = {
        anomalies: [
          {
            timestamp: '2024-01-01T10:00:00Z',
            value: 500,
            severity: 'high' as const,
            description: 'Pico inusual de participación'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await predictiveAnalyticsService.detectAnomalies(
        'participation',
        'hour'
      );

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/predictive/anomalies'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String)
        })
      );
    });

    it('debería manejar errores en la detección de anomalías', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error de red'));

      await expect(predictiveAnalyticsService.detectAnomalies(
        'participation',
        'hour'
      )).rejects.toThrow();
    });
  });
}); 