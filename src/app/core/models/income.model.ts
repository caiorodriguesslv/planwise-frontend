// ==========================================
// INCOME MODELS
// ==========================================

export interface IncomeResponse {
  id: number;
  description: string;
  value: number;
  date: string;
  createdAt: string;
  active: boolean;
  category: {
    id: number;
    name: string;
    type: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface IncomeRequest {
  description: string;
  value: number;
  date: string;
  categoryId: number;
}

export interface IncomeFilters {
  search?: string;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

export interface IncomeStats {
  total: number;
  average: number;
  count: number;
}


