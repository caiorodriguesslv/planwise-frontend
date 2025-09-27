import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Services e Models
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryResponse, CategoryType, CategoryFilters, CategoryStats } from '../../../core/models/category.model';
import { PaginatedResponse, PageRequest } from '../../../core/models/api.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="category-list-container">
      <!-- Header principal -->
      <div class="page-header">
        <div class="page-title">
          <mat-icon class="page-icon">category</mat-icon>
          <div class="title-content">
            <h1>Minhas Categorias</h1>
            <p>Organize suas receitas e despesas por categoria</p>
          </div>
        </div>
        <button mat-raised-button color="primary" class="new-category-btn" (click)="createNew()">
          <mat-icon>add</mat-icon>
          Nova Categoria
        </button>
      </div>

      <!-- Cards de estatísticas -->
      <div class="stats-cards">
        <mat-card class="stat-card total">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>category</mat-icon>
            </div>
            <div class="stat-content">
              <h2>{{ stats.total }}</h2>
              <p>Total de Categorias</p>
              <span class="stat-period">Ativas</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card green">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-content">
              <h2>{{ stats.byType.receitas }}</h2>
              <p>Receitas</p>
              <span class="stat-period">Categorias de entrada</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card red">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>trending_down</mat-icon>
            </div>
            <div class="stat-content">
              <h2>{{ stats.byType.despesas }}</h2>
              <p>Despesas</p>
              <span class="stat-period">Categorias de saída</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-header class="filters-header">
          <mat-card-title>
            <mat-icon>filter_list</mat-icon>
            Filtros de Busca
          </mat-card-title>
          <div class="filters-actions">
            <span class="active-filters" *ngIf="getActiveFiltersCount() > 0">
              {{ getActiveFiltersCount() }} filtro(s) ativo(s)
            </span>
            <button mat-button (click)="clearFilters()" [class.disabled]="getActiveFiltersCount() === 0">
              <mat-icon>clear</mat-icon>
              Limpar
            </button>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <div class="filter-grid">
              <mat-form-field appearance="outline" class="filter-search">
                <mat-label>Buscar categorias</mat-label>
                <input matInput 
                       formControlName="search" 
                       placeholder="Digite o nome da categoria...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-type">
                <mat-label>Tipo</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="">
                    <span class="select-all-option">
                      Todos os tipos
                    </span>
                  </mat-option>
                  <mat-option value="RECEITA">
                    <span class="type-option receita">
                      <mat-icon>trending_up</mat-icon>
                      Receita
                    </span>
                  </mat-option>
                  <mat-option value="DESPESA">
                    <span class="type-option despesa">
                      <mat-icon>trending_down</mat-icon>
                      Despesa
                    </span>
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Tabela de categorias -->
      <mat-card class="table-card">
        <mat-card-content>
          <!-- Loading spinner -->
          <div *ngIf="isLoading" class="loading-container">
            <mat-progress-spinner mode="indeterminate" diameter="60"></mat-progress-spinner>
            <h3>Carregando categorias...</h3>
            <p>Por favor, aguarde enquanto buscamos seus dados.</p>
          </div>

          <!-- Tabela ou Estado Vazio -->
          <div *ngIf="!isLoading" class="table-container">
            <!-- Tabela de dados -->
            <div *ngIf="categories.length > 0" class="data-table">
              <table mat-table [dataSource]="categories" class="categories-table">
                <!-- Coluna Nome -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef class="name-header">Nome</th>
                  <td mat-cell *matCellDef="let category" class="name-cell">
                    <div class="name-content">
                      <div class="category-color" [style.background-color]="category.color || getDeterministicColor(category.type, category.id)"></div>
                      <strong>{{ category.name }}</strong>
                    </div>
                  </td>
                </ng-container>

                <!-- Coluna Tipo -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef class="type-header">Tipo</th>
                  <td mat-cell *matCellDef="let category" class="type-cell">
                    <mat-chip [class]="'type-chip ' + (category.type === 'RECEITA' ? 'receita' : 'despesa')">
                      <mat-icon>{{ category.type === 'RECEITA' ? 'trending_up' : 'trending_down' }}</mat-icon>
                      {{ category.type }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Coluna Data de Criação -->
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef class="date-header">Criado em</th>
                  <td mat-cell *matCellDef="let category" class="date-cell">
                    {{ formatDate(category.createdAt) }}
                  </td>
                </ng-container>

                <!-- Coluna Status -->
                <ng-container matColumnDef="active">
                  <th mat-header-cell *matHeaderCellDef class="status-header">Status</th>
                  <td mat-cell *matCellDef="let category" class="status-cell">
                    <mat-chip [class]="'status-chip ' + (category.active ? 'active' : 'inactive')">
                      <mat-icon>{{ category.active ? 'check_circle' : 'block' }}</mat-icon>
                      {{ category.active ? 'Ativa' : 'Inativa' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Coluna Ações -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="actions-header">Ações</th>
                  <td mat-cell *matCellDef="let category" class="actions-cell">
                    <div class="action-buttons">
                      <button mat-icon-button [matMenuTriggerFor]="actionsMenu" class="action-btn menu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      
                      <mat-menu #actionsMenu="matMenu">
                        <button mat-menu-item (click)="editCategory(category)">
                          <mat-icon>edit</mat-icon>
                          <span>Editar</span>
                        </button>
                        <button mat-menu-item (click)="duplicateCategory(category)">
                          <mat-icon>content_copy</mat-icon>
                          <span>Duplicar</span>
                        </button>
                        <mat-divider></mat-divider>
                        <button mat-menu-item (click)="deleteCategory(category)" class="delete-action">
                          <mat-icon>delete</mat-icon>
                          <span>Excluir</span>
                        </button>
                      </mat-menu>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns" class="table-header"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
              </table>
            </div>

            <!-- Estado vazio melhorado -->
            <div *ngIf="categories.length === 0" class="empty-state">
              <div class="empty-state-content">
                <div class="empty-icon">
                  <mat-icon>category</mat-icon>
                </div>
                <h3>{{ getActiveFiltersCount() > 0 ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada' }}</h3>
                <p>{{ getActiveFiltersCount() > 0 ? 'Tente ajustar os filtros de busca ou limpar todos os filtros.' : 'Comece criando sua primeira categoria para organizar suas receitas e despesas.' }}</p>
                <div class="empty-actions">
                  <button *ngIf="getActiveFiltersCount() > 0" mat-stroked-button (click)="clearFilters()" class="clear-btn">
                    <mat-icon>clear</mat-icon>
                    Limpar Filtros
                  </button>
                  <button mat-raised-button color="primary" (click)="createNew()" class="create-btn">
                    <mat-icon>add</mat-icon>
                    Nova Categoria
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginação -->
          <mat-paginator *ngIf="!isLoading && totalElements > 0"
                         [length]="totalElements"
                         [pageSize]="pageRequest.size"
                         [pageSizeOptions]="[5, 10, 20, 50]"
                         (page)="onPageChange($event)"
                         aria-label="Selecione a página de categorias">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .category-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: 100vh;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 32px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      
      .page-title {
        display: flex;
        align-items: center;
        gap: 20px;
        
        .page-icon {
          width: 60px;
          height: 60px;
          font-size: 32px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .title-content {
          h1 {
            margin: 0 0 4px 0;
            font-size: 28px;
            font-weight: 700;
            color: #1a202c;
          }
          
          p {
            margin: 0;
            color: #64748b;
            font-size: 15px;
          }
        }
      }
      
      .new-category-btn {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
        color: white !important;
        padding: 12px 24px;
        font-weight: 600;
        border-radius: 12px;
        
        mat-icon {
          margin-right: 8px;
        }
        
        &:hover {
          background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }
      }
    }

    /* Stats Cards */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
      
      .stat-card {
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s ease;
        border: 1px solid #e2e8f0;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        
        mat-card-content {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          
          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
            color: white;
          }
        }
        
        .stat-content {
          flex: 1;
          
          h2 {
            margin: 0 0 4px 0;
            font-size: 32px;
            font-weight: 700;
            color: #1a202c;
          }
          
          p {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1a202c;
          }
          
          .stat-period {
            font-size: 12px;
            color: #64748b;
          }
        }
        
        &.total .stat-icon {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        
        &.green .stat-icon {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        
        &.red .stat-icon {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
      }
    }

    /* Filters */
    .filters-card {
      margin-bottom: 24px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      
      .filters-header {
        padding: 24px 24px 0;
        
        mat-card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
          
          mat-icon {
            color: #8b5cf6;
          }
        }
        
        .filters-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          
          .active-filters {
            color: #8b5cf6;
            font-size: 13px;
            font-weight: 600;
          }
          
          button.disabled {
            opacity: 0.5;
            pointer-events: none;
          }
        }
      }
      
      .filters-form {
        .filter-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          
          .select-all-option, .type-option {
            display: flex;
            align-items: center;
            gap: 8px;
            
            &.receita mat-icon {
              color: #10b981;
            }
            
            &.despesa mat-icon {
              color: #ef4444;
            }
          }
        }
      }
    }

    /* Table */
    .table-card {
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 20px;
        text-align: center;
        
        h3 {
          margin: 16px 0 8px 0;
          color: #1a202c;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          color: #64748b;
        }
      }
      
      .categories-table {
        width: 100%;
        
        .table-header {
          background: #f8fafc;
          
          th {
            border-bottom: 2px solid #e2e8f0;
            font-weight: 600;
            color: #374151;
            padding: 16px 12px;
          }
        }
        
        .table-row {
          transition: background-color 0.2s ease;
          
          &:hover {
            background: #f8fafc;
          }
          
          td {
            padding: 16px 12px;
            border-bottom: 1px solid #f1f5f9;
          }
        }
        
        .name-cell {
          .name-content {
            display: flex;
            align-items: center;
            gap: 12px;
            
            .category-color {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              flex-shrink: 0;
            }
          }
        }
        
        .type-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          
          &.receita {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #065f46;
          }
          
          &.despesa {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #7f1d1d;
          }
          
          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
        
        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          
          &.active {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #065f46;
          }
          
          &.inactive {
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            color: #374151;
          }
          
          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
          
          .action-btn {
            color: #64748b;
            
            &:hover {
              color: #8b5cf6;
              background: rgba(139, 92, 246, 0.1);
            }
          }
        }
      }
    }

    /* Empty State */
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
      
      .empty-state-content {
        max-width: 400px;
        
        .empty-icon {
          width: 120px;
          height: 120px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          mat-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            color: #9ca3af;
          }
        }
        
        h3 {
          margin: 0 0 12px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a202c;
        }
        
        p {
          margin: 0 0 24px 0;
          color: #64748b;
          line-height: 1.6;
        }
        
        .empty-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
      }
    }

    /* Menu customizations */
    ::ng-deep .mat-mdc-menu-panel {
      .delete-action {
        color: #ef4444 !important;
        
        mat-icon {
          color: #ef4444 !important;
        }
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .category-list-container {
        padding: 16px;
      }
      
      .page-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }
      
      .stats-cards {
        grid-template-columns: 1fr;
      }
      
      .filters-form .filter-grid {
        grid-template-columns: 1fr;
      }
      
      .categories-table {
        font-size: 14px;
        
        .table-row td {
          padding: 12px 8px;
        }
      }
    }
  `]
})
export class CategoryListComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Data
  categories: CategoryResponse[] = [];
  stats: CategoryStats = {
    total: 0,
    byType: {
      receitas: 0,
      despesas: 0
    }
  };
  totalElements = 0;

  // Pagination
  pageRequest: PageRequest = {
    page: 0,
    size: 10,
    sort: 'name',
    direction: 'ASC'
  };

  // Form
  filterForm: FormGroup;

  // UI State
  isLoading = false;
  displayedColumns: string[] = ['name', 'type', 'createdAt', 'active', 'actions'];

  constructor(
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.setupFilterWatchers();
    this.loadCategories();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      type: ['']
    });
  }

  private setupFilterWatchers(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageRequest.page = 0;
        this.loadCategories();
      });
  }

  loadCategories(): void {
    this.isLoading = true;
    const filters = this.buildFilters();
    
    this.categoryService.getCategories(this.pageRequest, filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.notificationService.error('Erro ao carregar categorias');
          return of({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: this.pageRequest.size,
            number: this.pageRequest.page,
            first: true,
            last: true,
            empty: true,
            pageable: {
              pageNumber: 0,
              pageSize: 10,
              sort: { sorted: false, unsorted: true }
            },
            numberOfElements: 0
          });
        })
      )
      .subscribe((response: PaginatedResponse<CategoryResponse>) => {
        this.categories = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      });
  }

  loadStats(): void {
    this.categoryService.getCategoryStats()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          return of({
            total: 0,
            byType: {
              receitas: 0,
              despesas: 0
            }
          });
        })
      )
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  private buildFilters(): CategoryFilters {
    const formValue = this.filterForm.value;
    const filters: CategoryFilters = {};

    if (formValue.search?.trim()) {
      filters.search = formValue.search.trim();
    }

    if (formValue.type) {
      filters.type = formValue.type as CategoryType;
    }

    return filters;
  }

  getActiveFiltersCount(): number {
    const filters = this.buildFilters();
    let count = 0;
    
    if (filters.search) count++;
    if (filters.type) count++;
    
    return count;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.pageRequest.page = 0;
    this.loadCategories();
    this.notificationService.info('Filtros limpos');
  }

  onPageChange(event: PageEvent): void {
    this.pageRequest.page = event.pageIndex;
    this.pageRequest.size = event.pageSize;
    this.loadCategories();
  }

  getCategoryColor(type: CategoryType): string {
    return this.categoryService.generateCategoryColor(type);
  }

  getDeterministicColor(type: CategoryType, id: number): string {
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
    // Usar o ID para gerar um índice determinístico
    const index = id % typeColors.length;
    return typeColors[index];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  createNew(): void {
    this.notificationService.info('Redirecionando para criar nova categoria...');
    // Emitir evento para navegar para o formulário
    window.dispatchEvent(new CustomEvent('navigate-to-module', { 
      detail: { module: 'nova-categoria' } 
    }));
  }

  editCategory(category: CategoryResponse): void {
    this.notificationService.info(`Editando categoria: ${category.name}`);
    // Implementar navegação para edição
  }

  duplicateCategory(category: CategoryResponse): void {
    this.notificationService.info(`Duplicando categoria: ${category.name}`);
    // Implementar duplicação
  }

  deleteCategory(category: CategoryResponse): void {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.notificationService.error('Erro ao deletar categoria');
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.notificationService.success('Categoria excluída com sucesso');
            this.loadCategories();
            this.loadStats();
          }
        });
    }
  }
}
