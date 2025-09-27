export interface CategoryRequest {
  name: string;
  type: CategoryType;
}

export interface CategoryResponse {
  id: number;
  name: string;
  type: CategoryType;
  createdAt: string;
  active: boolean;
  color?: string; // Campo adicional para UI
}

export enum CategoryType {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA'
}

export interface CategoryFilters {
  search?: string;
  type?: CategoryType;
}

export interface CategoryStats {
  total: number;
  byType: {
    receitas: number;
    despesas: number;
  };
}
