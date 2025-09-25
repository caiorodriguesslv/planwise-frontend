import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { HttpService } from './http.service';
import { 
  ExpenseRequest, 
  ExpenseResponse, 
  ExpenseFilters, 
  ExpenseStats,
  CategoryResponse 
} from '../models/expense.model';
import { PaginatedResponse, PageRequest } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly baseEndpoint = 'expenses';

  constructor(private httpService: HttpService) {}

  /**
   * Criar nova despesa
   */
  createExpense(expense: ExpenseRequest): Observable<ExpenseResponse> {
    return this.httpService.post<ExpenseResponse>(this.baseEndpoint, expense);
  }

  /**
   * Obter todas as despesas com paginação
   */
  getAllExpenses(pageRequest?: PageRequest): Observable<PaginatedResponse<ExpenseResponse>> {
    return this.httpService.getPageable<ExpenseResponse>(this.baseEndpoint, pageRequest);
  }

  /**
   * Obter todas as despesas como lista simples
   */
  getAllExpensesList(): Observable<ExpenseResponse[]> {
    return this.httpService.get<ExpenseResponse[]>(`${this.baseEndpoint}/all`);
  }

  /**
   * Obter despesa por ID
   */
  getExpenseById(id: number): Observable<ExpenseResponse> {
    return this.httpService.get<ExpenseResponse>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Atualizar despesa
   */
  updateExpense(id: number, expense: ExpenseRequest): Observable<ExpenseResponse> {
    return this.httpService.put<ExpenseResponse>(`${this.baseEndpoint}/${id}`, expense);
  }

  /**
   * Excluir despesa
   */
  deleteExpense(id: number): Observable<string> {
    return this.httpService.delete<string>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Buscar despesas por categoria
   */
  getExpensesByCategory(categoryId: number): Observable<ExpenseResponse[]> {
    return this.httpService.get<ExpenseResponse[]>(`${this.baseEndpoint}/category/${categoryId}`);
  }

  /**
   * Buscar despesas por período
   */
  getExpensesByDateRange(startDate: string, endDate: string): Observable<ExpenseResponse[]> {
    const params = { startDate, endDate };
    return this.httpService.get<ExpenseResponse[]>(`${this.baseEndpoint}/date-range`, { params });
  }

  /**
   * Buscar despesas por termo
   */
  searchExpenses(search: string): Observable<ExpenseResponse[]> {
    const params = { search };
    return this.httpService.get<ExpenseResponse[]>(`${this.baseEndpoint}/search`, { params });
  }

  /**
   * Obter total de despesas
   */
  getTotalExpense(): Observable<number> {
    return this.httpService.get<number>(`${this.baseEndpoint}/total`);
  }

  /**
   * Obter total de despesas por período
   */
  getTotalExpenseByDateRange(startDate: string, endDate: string): Observable<number> {
    const params = { startDate, endDate };
    return this.httpService.get<number>(`${this.baseEndpoint}/total/date-range`, { params });
  }

  /**
   * Obter estatísticas das despesas
   */
  getExpenseStats(filters?: ExpenseFilters): Observable<ExpenseStats> {
    if (filters?.startDate && filters?.endDate) {
      return this.getTotalExpenseByDateRange(filters.startDate, filters.endDate)
        .pipe(map(total => ({ total, count: 0, average: 0 })));
    }
    
    return this.getTotalExpense()
      .pipe(map(total => ({ total, count: 0, average: 0 })));
  }

  /**
   * Obter despesas filtradas
   */
  getFilteredExpenses(filters: ExpenseFilters): Observable<ExpenseResponse[]> {
    if (filters.startDate && filters.endDate) {
      return this.getExpensesByDateRange(filters.startDate, filters.endDate);
    }
    
    if (filters.categoryId) {
      return this.getExpensesByCategory(filters.categoryId);
    }
    
    if (filters.search) {
      return this.searchExpenses(filters.search);
    }
    
    return this.getAllExpensesList();
  }

  /**
   * Obter categorias do tipo DESPESA
   */
  getExpenseCategories(): Observable<CategoryResponse[]> {
    return this.httpService.get<CategoryResponse[]>('categories/type/DESPESA');
  }

  /**
   * Formatters e Utilities
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('pt-BR');
  }

  /**
   * Validações
   */
  validateExpense(expense: ExpenseRequest): string[] {
    const errors: string[] = [];

    if (!expense.description || expense.description.trim().length < 3) {
      errors.push('Descrição deve ter pelo menos 3 caracteres');
    }

    if (!expense.value || expense.value <= 0) {
      errors.push('Valor deve ser maior que zero');
    }

    if (!expense.date) {
      errors.push('Data é obrigatória');
    }

    if (!expense.categoryId) {
      errors.push('Categoria é obrigatória');
    }

    return errors;
  }
}
