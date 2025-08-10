import type { PrizeWithCode } from '../types/wheel.types';

export interface ValidationResponse {
  success: boolean;
  message: string;
  prize?: PrizeWithCode;
}

export interface ValidationRequest {
  code: string;
  storeId: string;
}

class PrizeValidationService {
  private readonly API_URL = '/api/prizes/validate';

  async validatePrize(request: ValidationRequest): Promise<ValidationResponse> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Error en la validación del premio');
      }

      const data = await response.json();
      return {
        success: data.success,
        message: data.message,
        prize: data.prize,
      };
    } catch (error) {
      console.error('Error validating prize:', error);
      return {
        success: false,
        message: 'Error al validar el premio. Por favor, intenta nuevamente.',
      };
    }
  }

  async checkPrizeStatus(code: string): Promise<ValidationResponse> {
    try {
      const response = await fetch(`${this.API_URL}/status/${code}`);
      
      if (!response.ok) {
        throw new Error('Error al verificar el estado del premio');
      }

      const data = await response.json();
      return {
        success: data.success,
        message: data.message,
        prize: data.prize,
      };
    } catch (error) {
      console.error('Error checking prize status:', error);
      return {
        success: false,
        message: 'Error al verificar el estado del premio.',
      };
    }
  }
}

export const prizeValidationService = new PrizeValidationService(); 