import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { HttpService } from './http.service';
import { ApiResponse, PaginatedResponse, PageRequest } from '../models/api.model';
import { 
  CategoryRequest, 
  CategoryResponse, 
  CategoryType, 
  CategoryFilters, 
  CategoryStats 
} from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly endpoint = 'categories';

  constructor(private httpService: HttpService) {}

  /**
   * Criar nova categoria
   */
  createCategory(request: CategoryRequest): Observable<CategoryResponse> {
    return this.httpService.post<ApiResponse<CategoryResponse>>(this.endpoint, request)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Erro ao criar categoria:', error);
          throw error;
        })
      );
  }

  /**
   * Buscar todas as categorias (sem paginação)
   */
  getAllCategories(): Observable<CategoryResponse[]> {
    return this.httpService.get<CategoryResponse[]>(`${this.endpoint}/all`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar categorias:', error);
          return of([]);
        })
      );
  }

  /**
   * Buscar categorias com paginação
   */
  getCategories(pageRequest: PageRequest, filters?: CategoryFilters): Observable<PaginatedResponse<CategoryResponse>> {
    let params: any = {
      page: pageRequest.page,
      size: pageRequest.size,
      sort: pageRequest.sort || 'name,asc'
    };

    if (filters?.search) {
      // Se há busca, usar endpoint de search
      return this.searchCategories(filters.search);
    }

    if (filters?.type) {
      return this.getCategoriesByType(filters.type);
    }

    return this.httpService.getPageable<CategoryResponse>(this.endpoint, params)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar categorias paginadas:', error);
          return of({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: pageRequest.size,
            number: pageRequest.page,
            first: true,
            last: true,
            empty: true,
            pageable: {
              pageNumber: pageRequest.page || 0,
              pageSize: pageRequest.size || 10,
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
   * Buscar categorias por tipo
   */
  getCategoriesByType(type: CategoryType): Observable<PaginatedResponse<CategoryResponse>> {
    return this.httpService.get<CategoryResponse[]>(`${this.endpoint}/type/${type}`)
      .pipe(
        map(categories => ({
          content: categories,
          totalElements: categories.length,
          totalPages: 1,
          size: categories.length,
          number: 0,
          first: true,
          last: true,
          empty: categories.length === 0,
          pageable: {
            pageNumber: 0,
            pageSize: categories.length,
            sort: {
              sorted: false,
              unsorted: true
            }
          },
          numberOfElements: categories.length
        })),
        catchError(error => {
          console.error('Erro ao buscar categorias por tipo:', error);
          return of({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 0,
            number: 0,
            first: true,
            last: true,
            empty: true,
            pageable: {
              pageNumber: 0,
              pageSize: 0,
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
   * Buscar categoria por ID
   */
  getCategoryById(id: number): Observable<CategoryResponse> {
    return this.httpService.get<CategoryResponse>(`${this.endpoint}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar categoria por ID:', error);
          throw error;
        })
      );
  }

  /**
   * Atualizar categoria
   */
  updateCategory(id: number, request: CategoryRequest): Observable<CategoryResponse> {
    return this.httpService.put<ApiResponse<CategoryResponse>>(`${this.endpoint}/${id}`, request)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Erro ao atualizar categoria:', error);
          throw error;
        })
      );
  }

  /**
   * Deletar categoria
   */
  deleteCategory(id: number): Observable<void> {
    return this.httpService.delete<ApiResponse<string>>(`${this.endpoint}/${id}`)
      .pipe(
        map(() => {}),
        catchError(error => {
          console.error('Erro ao deletar categoria:', error);
          throw error;
        })
      );
  }

  /**
   * Buscar categorias por nome
   */
  searchCategories(search: string): Observable<PaginatedResponse<CategoryResponse>> {
    return this.httpService.get<CategoryResponse[]>(`${this.endpoint}/search?search=${encodeURIComponent(search)}`)
      .pipe(
        map(categories => ({
          content: categories,
          totalElements: categories.length,
          totalPages: 1,
          size: categories.length,
          number: 0,
          first: true,
          last: true,
          empty: categories.length === 0,
          pageable: {
            pageNumber: 0,
            pageSize: categories.length,
            sort: {
              sorted: false,
              unsorted: true
            }
          },
          numberOfElements: categories.length
        })),
        catchError(error => {
          console.error('Erro ao buscar categorias:', error);
          return of({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 0,
            number: 0,
            first: true,
            last: true,
            empty: true,
            pageable: {
              pageNumber: 0,
              pageSize: 0,
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
   * Buscar categorias de despesa (para formulários)
   */
  getExpenseCategories(): Observable<CategoryResponse[]> {
    return this.httpService.get<CategoryResponse[]>(`${this.endpoint}/type/DESPESA`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar categorias de despesa:', error);
          return of([]);
        })
      );
  }

  /**
   * Buscar categorias de receita (para formulários)
   */
  getIncomeCategories(): Observable<CategoryResponse[]> {
    return this.httpService.get<CategoryResponse[]>(`${this.endpoint}/type/RECEITA`)
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar categorias de receita:', error);
          return of([]);
        })
      );
  }

  /**
   * Estatísticas das categorias
   */
  getCategoryStats(): Observable<CategoryStats> {
    return this.getAllCategories()
      .pipe(
        map(categories => {
          const receitas = categories.filter(c => c.type === CategoryType.RECEITA).length;
          const despesas = categories.filter(c => c.type === CategoryType.DESPESA).length;
          
          return {
            total: categories.length,
            byType: {
              receitas,
              despesas
            }
          };
        }),
        catchError(error => {
          console.error('Erro ao calcular estatísticas:', error);
          return of({
            total: 0,
            byType: {
              receitas: 0,
              despesas: 0
            }
          });
        })
      );
  }

  /**
   * Utility: Gerar cores para categorias
   */
  generateCategoryColor(type: CategoryType): string {
    const colors = {
      [CategoryType.RECEITA]: [
        '#10b981', '#059669', '#16a34a', '#22c55e', '#15803d',
        '#84cc16', '#65a30d', '#a3e635', '#bef264', '#eab308'
      ],
      [CategoryType.DESPESA]: [
        '#ef4444', '#dc2626', '#b91c1c', '#f87171', '#fca5a5',
        '#fb923c', '#ea580c', '#c2410c', '#9a3412', '#f97316'
      ]
    };
    
    const typeColors = colors[type];
    return typeColors[Math.floor(Math.random() * typeColors.length)];
  }

  /**
   * Utility: Verificar se categoria está em uso
   */
  isCategoryInUse(categoryId: number): Observable<boolean> {
    // Esta funcionalidade pode ser implementada futuramente
    // verificando se há despesas/receitas vinculadas à categoria
    return of(false);
  }
}
