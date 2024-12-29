export interface UniqueCode {
  code: string;
  prizeId: number;
  createdAt: number;
  expiresAt: number;
  isUsed: boolean;
  usedAt?: number;
  usedBy?: string;
}

export interface GenerateCodeResponse {
  success: boolean;
  data?: UniqueCode;
  error?: string;
}

export interface ValidateCodeResponse {
  success: boolean;
  isValid: boolean;
  code?: UniqueCode;
  error?: string;
}

export interface UseCodeResponse {
  success: boolean;
  code?: UniqueCode;
  error?: string;
}
