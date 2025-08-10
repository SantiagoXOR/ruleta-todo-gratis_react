import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '../storage';

// Mock de localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: vi.fn(() => Object.keys(store).length),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('StorageService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('set', () => {
    it('debe almacenar datos correctamente', () => {
      const testData = { test: 'data' };
      storage.set('test', testData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ruleta_test',
        expect.stringContaining('"value":{"test":"data"}')
      );
    });

    it('debe manejar errores al almacenar', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      expect(() => storage.set('test', { data: 'test' }))
        .toThrow('No se pudo guardar el dato en el almacenamiento local');
    });
  });

  describe('get', () => {
    it('debe recuperar datos correctamente', () => {
      const testData = { test: 'data' };
      const storedItem = {
        value: testData,
        timestamp: Date.now(),
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedItem));

      const result = storage.get('test');
      expect(result).toEqual(testData);
    });

    it('debe retornar null para datos expirados', () => {
      const expiredItem = {
        value: { test: 'data' },
        timestamp: Date.now() - 2000,
        expiresIn: 1000,
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(expiredItem));

      const result = storage.get('test');
      expect(result).toBeNull();
    });

    it('debe manejar errores al recuperar datos', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      const result = storage.get('test');
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('debe eliminar datos correctamente', () => {
      storage.removeItem('test');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ruleta_test');
    });

    it('debe manejar errores al eliminar', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Error removing');
      });

      // No debería lanzar error
      expect(() => storage.removeItem('test')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('debe limpiar solo las claves con el prefijo correcto', () => {
      const mockStore = {
        'ruleta_test1': 'data1',
        'ruleta_test2': 'data2',
        'other_key': 'other_data'
      };

      Object.keys(mockStore).forEach(key => {
        localStorageMock.setItem(key, mockStore[key]);
      });

      storage.clear();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ruleta_test1');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ruleta_test2');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_key');
    });
  });

  describe('getTimeToExpiry', () => {
    it('debe calcular el tiempo restante correctamente', () => {
      const now = Date.now();
      const expiresIn = 1000;
      const item = {
        value: 'test',
        timestamp: now,
        expiresIn
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(item));

      const timeLeft = storage.getTimeToExpiry('test');
      expect(timeLeft).toBeLessThanOrEqual(expiresIn);
      expect(timeLeft).toBeGreaterThan(0);
    });

    it('debe retornar null para items sin expiración', () => {
      const item = {
        value: 'test',
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(item));

      expect(storage.getTimeToExpiry('test')).toBeNull();
    });
  });
}); 