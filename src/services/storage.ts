interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiry?: number;
}

class StorageService {
  private prefix: string = 'ruleta_';

  setItem(key: string, value: any, expiry?: number): void {
    const item: StorageItem<any> = {
      value,
      timestamp: Date.now(),
      expiry
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(this.prefix + key);
    if (!item) return null;

    const storageItem: StorageItem<T> = JSON.parse(item);
    
    // Verificar si el item ha expirado
    if (storageItem.expiry) {
      const now = Date.now();
      const age = now - storageItem.timestamp;
      if (age >= storageItem.expiry) {
        this.removeItem(key);
        return null;
      }
    }

    return storageItem.value;
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  // Método para limpiar items expirados
  clearExpired(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          const storageItem: StorageItem<any> = JSON.parse(item);
          if (storageItem.expiry) {
            const now = Date.now();
            const age = now - storageItem.timestamp;
            if (age >= storageItem.expiry) {
              localStorage.removeItem(key);
            }
          }
        }
      });
  }
}

export const storage = new StorageService(); 