import axios from 'axios';
import {
  UniqueCode
} from '../types/uniqueCodes.types';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ValidateCodeResponse extends ApiResponse {
  isValid: boolean;
  code?: string;
}

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

export const uniqueCodesApi = {
  async generateCode(prizeId: number, code: string): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/codes/generate`, {
        prizeId,
        code
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al generar el código'
      };
    }
  },

  async validateCode(code: string): Promise<ValidateCodeResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/codes/${code}/validate`);
      
      const responseData = response.data as { isValid?: boolean; code?: string };
      return {
        success: true,
        isValid: responseData?.isValid || false,
        code: responseData?.code || code
      };
    } catch (error: any) {
      return {
        success: false,
        isValid: false,
        code: code,
        error: error.response?.data?.message || error.message || 'Error al validar el código'
      };
    }
  },

  async useCode(code: string, userId: string): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/codes/${code}/use`, {
        userId
      });
      
      return {
        success: true,
        code: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al usar el código'
      };
    }
  }
};
