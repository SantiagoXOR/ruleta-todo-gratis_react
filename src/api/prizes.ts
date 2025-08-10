import axios from 'axios';
import { Prize } from '../types/prizes.types';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

export interface PrizeResponse {
  success: boolean;
  data?: Prize;
  error?: string;
}

export interface ClaimResponse {
  success: boolean;
  error?: string;
}

export const prizesApi = {
  async getPrizeByCode(code: string): Promise<PrizeResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/prizes/${code}`);
      return {
        success: true,
        data: response.data as Prize
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al verificar el premio'
      };
    }
  },

  async claimPrize(code: string): Promise<ClaimResponse> {
    try {
      await axios.post(`${API_BASE_URL}/prizes/${code}/claim`);
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al reclamar el premio'
      };
    }
  },

  async getAvailablePrizes(): Promise<Prize[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/prizes/available`);
      return response.data as Prize[];
    } catch (error) {
      console.error('Error fetching available prizes:', error);
      throw error;
    }
  },

  async getClaimedPrizes(): Promise<Prize[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/prizes/claimed`);
      return response.data as Prize[];
    } catch (error) {
      console.error('Error fetching claimed prizes:', error);
      throw error;
    }
  }
};
