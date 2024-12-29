/**
 * Servicio de caché para optimizar las consultas y reducir las llamadas al servidor
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.cache = new Map();
  }

  /**
   * Guarda un valor en el caché
   * @param key Clave del caché
   * @param value Valor a guardar
   * @param expiresIn Tiempo de expiración en milisegundos
   */
  set<T>(key: string, value: T, expiresIn: number = this.DEFAULT_EXPIRY): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  /**
   * Obtiene un valor del caché
   * @param key Clave del caché
   * @returns El valor almacenado o null si no existe o expiró
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Invalida una entrada del caché
   * @param key Clave del caché
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalida todas las entradas del caché que coincidan con el patrón
   * @param pattern Patrón para las claves a invalidar
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpia todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtiene un valor del caché o lo genera si no existe
   * @param key Clave del caché
   * @param generator Función para generar el valor si no existe en caché
   * @param expiresIn Tiempo de expiración en milisegundos
   * @returns El valor del caché o el generado
   */
  async getOrGenerate<T>(
    key: string,
    generator: () => Promise<T>,
    expiresIn: number = this.DEFAULT_EXPIRY
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await generator();
    this.set(key, value, expiresIn);
    return value;
  }

  /**
   * Verifica si una clave existe en el caché y no ha expirado
   * @param key Clave del caché
   * @returns true si la clave existe y no ha expirado
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Obtiene el tiempo restante antes de que expire una entrada
   * @param key Clave del caché
   * @returns Tiempo restante en milisegundos o -1 si no existe
   */
  getTimeToExpiry(key: string): number {
    const item = this.cache.get(key);
    if (!item) {
      return -1;
    }

    const now = Date.now();
    const timeToExpiry = item.expiresIn - (now - item.timestamp);
    return timeToExpiry > 0 ? timeToExpiry : -1;
  }
}

export const cacheService = new CacheService();
