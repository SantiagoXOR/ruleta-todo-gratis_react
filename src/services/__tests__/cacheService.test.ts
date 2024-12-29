import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService } from '../cacheService';

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
    vi.useFakeTimers();
  });

  it('almacena y recupera valores correctamente', () => {
    const key = 'test-key';
    const value = { data: 'test-value' };

    cacheService.set(key, value);
    expect(cacheService.get(key)).toEqual(value);
  });

  it('maneja la expiración de valores', () => {
    const key = 'test-key';
    const value = { data: 'test-value' };
    const expiresIn = 1000; // 1 segundo

    cacheService.set(key, value, expiresIn);
    expect(cacheService.get(key)).toEqual(value);

    // Avanzar tiempo más allá de la expiración
    vi.advanceTimersByTime(expiresIn + 100);
    expect(cacheService.get(key)).toBeNull();
  });

  it('invalida entradas específicas', () => {
    const key1 = 'test-key-1';
    const key2 = 'test-key-2';
    const value = { data: 'test-value' };

    cacheService.set(key1, value);
    cacheService.set(key2, value);

    cacheService.invalidate(key1);
    expect(cacheService.get(key1)).toBeNull();
    expect(cacheService.get(key2)).toEqual(value);
  });

  it('invalida entradas por patrón', () => {
    const key1 = 'test-pattern-1';
    const key2 = 'test-pattern-2';
    const key3 = 'other-key';
    const value = { data: 'test-value' };

    cacheService.set(key1, value);
    cacheService.set(key2, value);
    cacheService.set(key3, value);

    cacheService.invalidatePattern('^test-pattern');
    expect(cacheService.get(key1)).toBeNull();
    expect(cacheService.get(key2)).toBeNull();
    expect(cacheService.get(key3)).toEqual(value);
  });

  it('limpia todo el caché', () => {
    const keys = ['key1', 'key2', 'key3'];
    const value = { data: 'test-value' };

    keys.forEach(key => cacheService.set(key, value));
    cacheService.clear();

    keys.forEach(key => expect(cacheService.get(key)).toBeNull());
  });

  it('genera y almacena valores bajo demanda', async () => {
    const key = 'test-key';
    const value = { data: 'test-value' };
    const generator = vi.fn().mockResolvedValue(value);

    const result = await cacheService.getOrGenerate(key, generator);
    expect(result).toEqual(value);
    expect(generator).toHaveBeenCalledTimes(1);

    // Segunda llamada debería usar el caché
    const cachedResult = await cacheService.getOrGenerate(key, generator);
    expect(cachedResult).toEqual(value);
    expect(generator).toHaveBeenCalledTimes(1);
  });

  it('verifica la existencia de claves correctamente', () => {
    const key = 'test-key';
    const value = { data: 'test-value' };
    const expiresIn = 1000;

    expect(cacheService.has(key)).toBe(false);

    cacheService.set(key, value, expiresIn);
    expect(cacheService.has(key)).toBe(true);

    vi.advanceTimersByTime(expiresIn + 100);
    expect(cacheService.has(key)).toBe(false);
  });

  it('calcula el tiempo restante de expiración', () => {
    const key = 'test-key';
    const value = { data: 'test-value' };
    const expiresIn = 5000;

    cacheService.set(key, value, expiresIn);
    
    vi.advanceTimersByTime(2000);
    const timeToExpiry = cacheService.getTimeToExpiry(key);
    expect(timeToExpiry).toBeLessThanOrEqual(3000);
    expect(timeToExpiry).toBeGreaterThan(2900);

    vi.advanceTimersByTime(3100);
    expect(cacheService.getTimeToExpiry(key)).toBe(-1);
  });

  it('maneja múltiples operaciones concurrentes', async () => {
    const key = 'test-key';
    const value = { data: 'test-value' };
    const generator = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(value), 100))
    );

    // Realizar múltiples llamadas concurrentes
    const promises = Array(5).fill(null).map(() => 
      cacheService.getOrGenerate(key, generator)
    );

    const results = await Promise.all(promises);
    
    // Todas las llamadas deberían devolver el mismo valor
    results.forEach(result => expect(result).toEqual(value));
    
    // El generador solo debería haberse llamado una vez
    expect(generator).toHaveBeenCalledTimes(1);
  });

  it('maneja errores en el generador', async () => {
    const key = 'test-key';
    const error = new Error('Generator error');
    const generator = vi.fn().mockRejectedValue(error);

    await expect(cacheService.getOrGenerate(key, generator)).rejects.toThrow(error);
    expect(cacheService.get(key)).toBeNull();
  });
});
