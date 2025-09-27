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
    return this.httpService.post<CategoryResponse>(this.endpoint, request)
      .pipe(
        catchError(error => {
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
          return of([]);
        })
      );
  }

  /**
   * Buscar categorias com paginação
   */
  getCategories(pageRequest: PageRequest, filters?: CategoryFilters): Observable<PaginatedResponse<CategoryResponse>> {
    // Se há filtros, usar lógica de fallback
    if (filters?.search || filters?.type) {
      return this.getCategoriesWithFilters(pageRequest, filters);
    }

    // Sem filtros, usar paginação normal
    let params: any = {
      page: pageRequest.page,
      size: pageRequest.size,
      sort: pageRequest.sort || 'name,asc'
    };

    return this.httpService.getPageable<CategoryResponse>(this.endpoint, params)
      .pipe(
        catchError(error => {
          console.error('Error in getCategories:', error);
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
   * Buscar categorias com filtros (fallback para quando backend não suporta filtros paginados)
   */
  private getCategoriesWithFilters(pageRequest: PageRequest, filters: CategoryFilters): Observable<PaginatedResponse<CategoryResponse>> {
    // Primeiro, tenta buscar todas as categorias
    return this.getAllCategories()
      .pipe(
        map(allCategories => {
          // Aplicar filtros localmente
          let filteredCategories = [...allCategories];

          if (filters.search) {
            filteredCategories = filteredCategories.filter(cat => 
              cat.name.toLowerCase().includes(filters.search!.toLowerCase())
            );
          }

          if (filters.type) {
            filteredCategories = filteredCategories.filter(cat => 
              cat.type === filters.type
            );
          }

          // Aplicar paginação local
          const startIndex = (pageRequest.page || 0) * (pageRequest.size || 10);
          const endIndex = startIndex + (pageRequest.size || 10);
          const paginatedContent = filteredCategories.slice(startIndex, endIndex);

          return {
            content: paginatedContent,
            totalElements: filteredCategories.length,
            totalPages: Math.ceil(filteredCategories.length / (pageRequest.size || 10)),
            size: pageRequest.size || 10,
            number: pageRequest.page || 0,
            first: (pageRequest.page || 0) === 0,
            last: endIndex >= filteredCategories.length,
            empty: filteredCategories.length === 0,
            pageable: {
              pageNumber: pageRequest.page || 0,
              pageSize: pageRequest.size || 10,
              sort: {
                sorted: false,
                unsorted: true
              }
            },
            numberOfElements: paginatedContent.length
          };
        }),
        catchError(error => {
          console.error('Error in getCategoriesWithFilters:', error);
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
