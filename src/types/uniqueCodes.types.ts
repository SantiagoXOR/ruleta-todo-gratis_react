export interface UniqueCode {
  code: string;
  prizeId: number;
  timestamp: number;
  expiresAt: number;
  isUsed: boolean;
  createdAt?: string;
  usedAt?: string;
  usedBy?: string;
}

export interface CodeStatistics {
  total: number;
  used: number;
  expired: number;
  active: number;
  timeRange?: string;
  usageByDay?: Array<{
    date: string;
    count: number;
  }>;
  usageByPrize?: Array<{
    prizeName: string;
    count: number;
  }>;
}

export interface ListCodesResponse {
  success: boolean;
  data?: {
    codes: UniqueCode[];
    pagination: {
      page: number;
      totalPages: number;
      totalItems: number;
    };
  };
  error?: string;
}

export interface StatisticsResponse {
  success: boolean;
  data?: CodeStatistics;
  error?: string;
}

export interface ExportResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
  };
  error?: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  dateRange: 'all' | 'week' | 'month' | 'year';
  includeUsed: boolean;
  includeExpired: boolean;
  prizeId?: number;
}
