import { UniqueCode } from '../types/uniqueCodes.types';

class UniqueCodesApi {
  private readonly API_BASE = '/api/codes';

  /**
   * Genera un nuevo código único
   * @param prizeId ID del premio
   * @returns Respuesta con el código generado
   */
  async generateCode(prizeId: number): Promise<{ success: boolean; data?: UniqueCode; error?: string }> {
    try {
      const response = await fetch(`${this.API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prizeId }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data.data : undefined,
        error: !response.ok ? data.error || 'Error al generar código' : undefined
      };
    } catch (error) {
      console.error('Error generating code:', error);
      return { success: false, error: 'Error al generar código' };
    }
  }

  /**
   * Valida un código
   * @param code Código a validar
   * @returns Respuesta con el estado de validación
   */
  async validateCode(code: string): Promise<{ success: boolean; data?: { isValid: boolean; code: string }; error?: string }> {
    try {
      const response = await fetch(`${this.API_BASE}/${code}/validate`);
      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data.data : undefined,
        error: !response.ok ? data.error || 'Error al validar código' : undefined
      };
    } catch (error) {
      console.error('Error validating code:', error);
      return { success: false, error: 'Error al validar código' };
    }
  }

  /**
   * Usa un código
   * @param code Código a usar
   * @param userId ID del usuario
   * @returns Respuesta con el resultado
   */
  async useCode(code: string, userId: string): Promise<{ success: boolean; data?: { code: string; userId: string }; error?: string }> {
    try {
      const response = await fetch(`${this.API_BASE}/${code}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data.data : undefined,
        error: !response.ok ? data.error || 'Error al usar código' : undefined
      };
    } catch (error) {
      console.error('Error using code:', error);
      return { success: false, error: 'Error al usar código' };
    }
  }
}

export const uniqueCodesApi = new UniqueCodesApi(); 