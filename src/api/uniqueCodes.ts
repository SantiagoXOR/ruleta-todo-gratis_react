import axios from 'axios';
import { 
  UniqueCode, 
  GenerateCodeResponse, 
  ValidateCodeResponse, 
  UseCodeResponse 
} from '../types/uniqueCodes.types';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

export const uniqueCodesApi = {
  async generateCode(prizeId: number, code: string): Promise<GenerateCodeResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/codes/generate`, {
        prizeId,
        code
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || 'Error al generar el código'
        };
      }
      return {
        success: false,
        error: 'Error inesperado al generar el código'
      };
    }
  },

  async validateCode(code: string): Promise<ValidateCodeResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/codes/${code}/validate`);
      
      return {
        success: true,
        isValid: response.data.isValid,
        code: response.data.code
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          isValid: false,
          error: error.response?.data?.message || 'Error al validar el código'
        };
      }
      return {
        success: false,
        isValid: false,
        error: 'Error inesperado al validar el código'
      };
    }
  },

  async useCode(code: string, userId: string): Promise<UseCodeResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/codes/${code}/use`, {
        userId
      });
      
      return {
        success: true,
        code: response.data
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || 'Error al usar el código'
        };
      }
      return {
        success: false,
        error: 'Error inesperado al usar el código'
      };
    }
  }
};
