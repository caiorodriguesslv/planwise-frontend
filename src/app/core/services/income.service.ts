import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { HttpService } from './http.service';
import { NotificationService } from './notification.service';
import { 
  IncomeResponse, 
  IncomeRequest, 
  IncomeFilters, 
  IncomeStats 
} from '../models/income.model';
import { PaginatedResponse, PageRequest } from '../models/api.model';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  private readonly endpoint = API_ENDPOINTS.incomes;

  constructor(
    private http: HttpService,
    private notificationService: NotificationService
  ) {}

  /**
   * Buscar todas as receitas (paginado)
   */
  getAllIncomes(pageRequest: PageRequest, filters?: IncomeFilters): Observable<PaginatedResponse<IncomeResponse>> {
    let params: any = {
      page: (pageRequest.page ?? 0).toString(),
      size: (pageRequest.size ?? 10).toString()
    };

    if (pageRequest.sort) {
      params.sort = `${pageRequest.sort},${pageRequest.direction || 'ASC'}`;
    }

    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.categoryId) params.categoryId = filters.categoryId.toString();
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
    }

    return this.http.get<PaginatedResponse<IncomeResponse>>(this.endpoint, { params });
  }

  /**
   * Buscar todas as receitas sem paginação
   */
  getAllIncomesList(): Observable<IncomeResponse[]> {
    return this.http.get<IncomeResponse[]>(`${this.endpoint}/all`);
  }

  /**
   * Buscar receita por ID
   */
  getIncomeById(id: number): Observable<IncomeResponse> {
    return this.http.get<IncomeResponse>(`${this.endpoint}/${id}`);
  }

  /**
   * Criar nova receita
   */
  createIncome(income: IncomeRequest): Observable<IncomeResponse> {
    return this.http.post<IncomeResponse>(this.endpoint, income).pipe(
      map(response => {
        this.notificationService.success('Receita criada com sucesso!');
        return response;
      }),
      catchError(error => {
        this.notificationService.error('Erro ao criar receita');
        throw error;
      })
    );
  }

  /**
   * Atualizar receita
   */
  updateIncome(id: number, income: IncomeRequest): Observable<IncomeResponse> {
    return this.http.put<IncomeResponse>(`${this.endpoint}/${id}`, income).pipe(
      map(response => {
        this.notificationService.success('Receita atualizada com sucesso!');
        return response;
      }),
      catchError(error => {
        this.notificationService.error('Erro ao atualizar receita');
        throw error;
      })
    );
  }

  /**
   * Deletar receita
   */
  deleteIncome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(
      map(() => {
        this.notificationService.success('Receita excluída com sucesso!');
      }),
      catchError(error => {
        this.notificationService.error('Erro ao excluir receita');
        throw error;
      })
    );
  }

  /**
   * Buscar estatísticas de receitas
   */
  getIncomeStats(): Observable<IncomeStats> {
    return this.http.get<IncomeStats>(`${this.endpoint}/stats`).pipe(
      catchError(() => {
        // Retornar valores padrão em caso de erro
        return of({ total: 0, average: 0, count: 0 });
      })
    );
  }

  /**
   * Buscar receitas por categoria
   */
  getIncomesByCategory(categoryId: number): Observable<IncomeResponse[]> {
    return this.http.get<IncomeResponse[]>(`${this.endpoint}/category/${categoryId}`);
  }

  /**
   * Buscar receitas por período
   */
  getIncomesByDateRange(startDate: string, endDate: string): Observable<IncomeResponse[]> {
    const params = { startDate, endDate };
    return this.http.get<IncomeResponse[]>(`${this.endpoint}/date-range`, { params });
  }
}

