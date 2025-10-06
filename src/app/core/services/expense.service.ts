import { Injectable } from '@angular/core';
import { Observable, map, of, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpService } from './http.service';
import { CategoryService } from './category.service';
import { environment } from '../../../environments/environment';
import { 
  ExpenseRequest, 
  ExpenseResponse, 
  ExpenseFilters, 
  ExpenseStats 
} from '../models/expense.model';
import { CategoryResponse } from '../models/category.model';
import { PaginatedResponse, PageRequest } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly baseEndpoint = 'expenses';

  constructor(
    private httpService: HttpService,
    private http: HttpClient,
    private categoryService: CategoryService
  ) {}

  /**
   * Criar nova despesa
   */
  createExpense(expense: ExpenseRequest): Observable<ExpenseResponse> {
    return this.httpService.post<ExpenseResponse>(this.baseEndpoint, expense);
  }

  /**
   * Obter todas as despesas com paginação
   */
  getAllExpenses(pageRequest?: PageRequest, filters?: ExpenseFilters): Observable<PaginatedResponse<ExpenseResponse>> {
    // Se há filtros, usar lógica de fallback
    if (filters?.search || filters?.categoryId || filters?.startDate || filters?.endDate) {
      return this.getExpensesWithFilters(pageRequest, filters);
    }

    // Sem filtros, usar paginação normal
    return this.httpService.getPageable<ExpenseResponse>(this.baseEndpoint, pageRequest);
  }

  /**
   * Obter todas as despesas como lista simples
   */
  getAllExpensesList(): Observable<ExpenseResponse[]> {
    return this.httpService.get<ExpenseResponse[]>(`${this.baseEndpoint}/all`);
  }

  /**
   * Buscar despesas com filtros (fallback para quando backend não suporta filtros paginados)
   */
  private getExpensesWithFilters(pageRequest?: PageRequest, filters?: ExpenseFilters): Observable<PaginatedResponse<ExpenseResponse>> {
    // Primeiro, tenta buscar todas as despesas
    return this.getAllExpensesList()
      .pipe(
        map(allExpenses => {
          // Aplicar filtros localmente
          let filteredExpenses = [...allExpenses];

          if (filters?.search) {
            filteredExpenses = filteredExpenses.filter(expense => 
              expense.description.toLowerCase().includes(filters.search!.toLowerCase())
            );
          }

          if (filters?.categoryId) {
            filteredExpenses = filteredExpenses.filter(expense => 
              expense.category?.id === filters.categoryId
            );
          }

          if (filters?.startDate) {
            const startDate = new Date(filters.startDate);
            filteredExpenses = filteredExpenses.filter(expense => 
              new Date(expense.date) >= startDate
            );
          }

          if (filters?.endDate) {
            const endDate = new Date(filters.endDate);
            filteredExpenses = filteredExpenses.filter(expense => 
              new Date(expense.date) <= endDate
            );
          }

          // Aplicar paginação local
          const page = pageRequest?.page || 0;
          const size = pageRequest?.size || 10;
          const startIndex = page * size;
          const endIndex = startIndex + size;
          const paginatedContent = filteredExpenses.slice(startIndex, endIndex);

          return {
            content: paginatedContent,
            totalElements: filteredExpenses.length,
            totalPages: Math.ceil(filteredExpenses.length / size),
            size: size,
            number: page,
            first: page === 0,
            last: endIndex >= filteredExpenses.length,
            empty: filteredExpenses.length === 0,
            pageable: {
              pageNumber: page,
              pageSize: size,
              sort: {
                sorted: false,
                unsorted: true
              }
            },
            numberOfElements: paginatedContent.length
          };
        }),
        catchError((error: any) => {
          console.error('Error in getExpensesWithFilters:', error);
          return of({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: pageRequest?.size || 10,
            number: pageRequest?.page || 0,
            first: true,
            last: true,
            empty: true,
            pageable: {
              pageNumber: pageRequest?.page || 0,
              pageSize: pageRequest?.size || 10,
              sort: {
                sorted: false,
                unsorted: true
              }
            },
            numberOfElements: 0
          });
        })
      );
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
    return this.http.delete(`${environment.apiUrl}/${this.baseEndpoint}/${id}`, {
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('Erro ao excluir despesa:', error);
        return of('Erro ao excluir despesa');
      })
    );
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
    return this.categoryService.getExpenseCategories();
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
