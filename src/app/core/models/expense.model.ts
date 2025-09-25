export interface ExpenseRequest {
  description: string;
  value: number;
  date: string;
  categoryId: number;
}

export interface ExpenseResponse {
  id: number;
  description: string;
  value: number;
  date: string;
  createdAt: string;
  active: boolean;
  category: CategoryResponse;
}

export interface CategoryResponse {
  id: number;
  name: string;
  type: CategoryType;
  description?: string;
  active: boolean;
}

export enum CategoryType {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA'
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  search?: string;
}

export interface ExpenseStats {
  total: number;
  count: number;
  average: number;
}
