import { CategoryResponse, CategoryType } from './category.model';

// Re-export for backward compatibility
export type { CategoryResponse };
export { CategoryType };

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
