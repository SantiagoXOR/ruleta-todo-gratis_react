import type { PrizeWithCode } from '../types/wheel.types';

export interface PrizeHistoryItem extends PrizeWithCode {
  redeemedAt?: number;
  redeemedBy?: string;
  storeId?: string;
  timestamp?: number;
}

export interface PrizeHistoryResponse {
  success: boolean;
  message: string;
  prizes: PrizeHistoryItem[];
  total: number;
}

export interface PrizeHistoryFilter {
  startDate?: Date;
  endDate?: Date;
  storeId?: string;
  claimed?: boolean;
  page?: number;
  limit?: number;
}

export type ExportFormat = 'xlsx' | 'csv' | 'pdf';

class PrizeHistoryService {
  private readonly API_URL = '/api/prizes/history';

  async getPrizeHistory(filter: PrizeHistoryFilter = {}): Promise<PrizeHistoryResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter.startDate) {
        queryParams.append('startDate', filter.startDate.toISOString());
      }
      if (filter.endDate) {
        queryParams.append('endDate', filter.endDate.toISOString());
      }
      if (filter.storeId) {
        queryParams.append('storeId', filter.storeId);
      }
      if (filter.claimed !== undefined) {
        queryParams.append('claimed', filter.claimed.toString());
      }
      if (filter.page) {
        queryParams.append('page', filter.page.toString());
      }
      if (filter.limit) {
        queryParams.append('limit', filter.limit.toString());
      }

      const url = `${this.API_URL}?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al obtener el historial de premios');
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Historial obtenido exitosamente',
        prizes: data.prizes,
        total: data.total
      };
    } catch (error) {
      console.error('Error fetching prize history:', error);
      return {
        success: false,
        message: 'Error al obtener el historial de premios',
        prizes: [],
        total: 0
      };
    }
  }

  async exportHistory(filter: PrizeHistoryFilter = {}, format: ExportFormat = 'xlsx'): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
      queryParams.append('format', format);

      const url = `${this.API_URL}/export?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al exportar el historial');
      }

      const blob = await response.blob();
      return this.processExportBlob(blob, format);
    } catch (error) {
      console.error('Error exporting prize history:', error);
      throw new Error('No se pudo exportar el historial de premios');
    }
  }

  private async processExportBlob(blob: Blob, format: ExportFormat): Promise<Blob> {
    // Procesar el blob según el formato
    switch (format) {
      case 'csv':
        return new Blob([await blob.text()], { 
          type: 'text/csv;charset=utf-8;' 
        });
      case 'pdf':
        return new Blob([await blob.arrayBuffer()], { 
          type: 'application/pdf' 
        });
      case 'xlsx':
      default:
        return new Blob([await blob.arrayBuffer()], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
    }
  }

  getFileExtension(format: ExportFormat): string {
    switch (format) {
      case 'csv':
        return 'csv';
      case 'pdf':
        return 'pdf';
      case 'xlsx':
      default:
        return 'xlsx';
    }
  }

  getFileName(format: ExportFormat): string {
    const date = new Date().toISOString().split('T')[0];
    return `premios-${date}.${this.getFileExtension(format)}`;
  }
}

export const prizeHistoryService = new PrizeHistoryService(); 