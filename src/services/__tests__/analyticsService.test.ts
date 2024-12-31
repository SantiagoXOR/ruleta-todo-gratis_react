import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyticsService } from '../analyticsService';

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getGeneralAnalytics', () => {
    it('debe obtener analytics generales correctamente', async () => {
      const mockData = {
        totalSpins: 100,
        totalPrizesWon: 50,
        totalPrizesClaimed: 30,
        averageClaimTime: 120,
        prizeDistribution: {},
        timeSeriesData: [],
        userEngagement: {
          dailyActiveUsers: 50,
          weeklyActiveUsers: 200,
          monthlyActiveUsers: 500,
          returnRate: 0.75
        },
        performanceMetrics: {
          averageLoadTime: 1.2,
          errorRate: 0.02,
          successRate: 0.98
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await analyticsService.getGeneralAnalytics();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/general',
        expect.any(Object)
      );
    });

    it('debe manejar errores correctamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(analyticsService.getGeneralAnalytics())
        .rejects
        .toThrow('Error al obtener datos analíticos');
    });
  });

  describe('getPrizeAnalytics', () => {
    it('debe obtener analytics de premios correctamente', async () => {
      const mockData = {
        totalWins: 50,
        claimRate: 0.8,
        averageClaimTime: 90,
        popularityTrend: [0.5, 0.6, 0.7]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await analyticsService.getPrizeAnalytics('prize-123');
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/prizes/prize-123',
        expect.any(Object)
      );
    });
  });

  describe('trackEvent', () => {
    it('debe enviar eventos correctamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      });

      const eventData = {
        action: 'spin',
        result: 'win'
      };

      await analyticsService.trackEvent('wheel_spin', eventData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics/events',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String)
        })
      );

      const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(calledBody).toMatchObject({
        event: 'wheel_spin',
        data: eventData
      });
    });
  });

  describe('generateReport', () => {
    it('debe generar reportes en diferentes formatos', async () => {
      const mockBlob = new Blob(['test data']);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob)
      });

      const result = await analyticsService.generateReport('general', 'pdf');
      expect(result).toEqual(mockBlob);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/reports?type=general&format=pdf'),
        expect.any(Object)
      );
    });
  });
}); 