import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError, of, BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ExpenseService } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';
// import { LoadingService } from '../../../core/services/loading.service';
import { AuthService } from '../../../core/services/auth.service';
import { ExpenseResponse, CategoryResponse, ExpenseFilters } from '../../../core/models/expense.model';
import { PaginatedResponse } from '../../../core/models/api.model';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="expense-list-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h1>
            <mat-icon>trending_down</mat-icon>
            Minhas Despesas
          </h1>
          <p>Gerencie e monitore todos os seus gastos</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openExpenseForm()">
            <mat-icon>add</mat-icon>
            Nova Despesa
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total de Despesas</span>
            <span class="stat-value">{{ formatCurrency(totalExpenses) }}</span>
            <span class="stat-subtitle">Este mês</span>
          </div>
        </div>
        
        <div class="stat-card count">
          <div class="stat-icon">
            <mat-icon>receipt</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total de Transações</span>
            <span class="stat-value">{{ expenses.length }}</span>
            <span class="stat-subtitle">Despesas registradas</span>
          </div>
        </div>
        
        <div class="stat-card average">
          <div class="stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-content">
            <span class="stat-label">Média por Despesa</span>
            <span class="stat-value">{{ formatCurrency(averageExpense) }}</span>
            <span class="stat-subtitle">Valor médio</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-header">
          <h3>Filtros</h3>
          <button mat-button (click)="clearFilters()" [disabled]="!hasActiveFilters()">
            <mat-icon>clear</mat-icon>
            Limpar
          </button>
        </div>
        
        <div class="filters-content">
          <mat-form-field class="filter-field">
            <mat-label>Buscar</mat-label>
            <input matInput 
                   [(ngModel)]="filters.search" 
                   (ngModelChange)="onSearchChange($event)"
                   placeholder="Buscar por descrição...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field class="filter-field">
            <mat-label>Categoria</mat-label>
            <mat-select [(ngModel)]="filters.categoryId" (ngModelChange)="applyFilters()">
              <mat-option value="">Todas as categorias</mat-option>
              <mat-option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field class="filter-field">
            <mat-label>Data Inicial</mat-label>
            <input matInput 
                   [matDatepicker]="startPicker" 
                   [(ngModel)]="startDate"
                   (ngModelChange)="onDateRangeChange()">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field class="filter-field">
            <mat-label>Data Final</mat-label>
            <input matInput 
                   [matDatepicker]="endPicker" 
                   [(ngModel)]="endDate"
                   (ngModelChange)="onDateRangeChange()">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <!-- Active Filters -->
        <div class="active-filters" *ngIf="hasActiveFilters()">
          <span class="filters-label">Filtros ativos:</span>
          <mat-chip-set>
            <mat-chip *ngIf="filters.search" (removed)="removeFilter('search')">
              Busca: "{{ filters.search }}"
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
            <mat-chip *ngIf="filters.categoryId" (removed)="removeFilter('categoryId')">
              Categoria: {{ getCategoryName(filters.categoryId) }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
            <mat-chip *ngIf="filters.startDate" (removed)="removeFilter('dateRange')">
              Período: {{ formatDate(filters.startDate) }} - {{ formatDate(filters.endDate || '') }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </mat-chip-set>
        </div>
      </mat-card>

      <!-- Table -->
      <mat-card class="table-card">
        <div class="table-header">
          <h3>Lista de Despesas</h3>
          <div class="table-actions">
            <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Mais opções">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="exportExpenses()">
                <mat-icon>download</mat-icon>
                Exportar
              </button>
              <button mat-menu-item (click)="refreshExpenses()">
                <mat-icon>refresh</mat-icon>
                Atualizar
              </button>
            </mat-menu>
          </div>
        </div>

        <div class="table-container" *ngIf="!isLoading; else loadingTemplate">
          <table mat-table [dataSource]="expenses" matSort class="expense-table">
            
            <!-- Data Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Data</th>
              <td mat-cell *matCellDef="let expense">
                <div class="date-cell">
                  <span class="date">{{ formatDate(expense.date) }}</span>
                  <span class="time">{{ formatTime(expense.createdAt) }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Descrição</th>
              <td mat-cell *matCellDef="let expense">
                <div class="description-cell">
                  <span class="description">{{ expense.description }}</span>
                  <span class="category">{{ expense.category.name }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Category Column -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Categoria</th>
              <td mat-cell *matCellDef="let expense">
                <mat-chip class="category-chip">
                  {{ expense.category.name }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Value Column -->
            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Valor</th>
              <td mat-cell *matCellDef="let expense">
                <span class="value expense-value">{{ formatCurrency(expense.value) }}</span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Ações</th>
              <td mat-cell *matCellDef="let expense" class="actions-cell">
                <button mat-icon-button 
                        (click)="viewExpense(expense)"
                        matTooltip="Ver detalhes">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button 
                        (click)="editExpense(expense)"
                        matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button 
                        (click)="deleteExpense(expense)"
                        matTooltip="Excluir"
                        class="delete-button">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="expense-row"></tr>
          </table>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="expenses.length === 0">
            <mat-icon>receipt_long</mat-icon>
            <h3>Nenhuma despesa encontrada</h3>
            <p>{{ hasActiveFilters() ? 'Tente ajustar os filtros ou' : 'Comece' }} 
               <a (click)="openExpenseForm()">criando sua primeira despesa</a></p>
            
            <!-- Debug Info -->
            <div class="debug-info" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 12px;">
              <h4>🔧 Debug Info:</h4>
              <p><strong>Loading:</strong> {{ isLoading }}</p>
              <p><strong>Categories loaded:</strong> {{ categories.length }}</p>
              <p><strong>API URL:</strong> {{ getApiUrl() }}</p>
              <p><strong>Has Token:</strong> {{ hasAuthToken() }}</p>
              <p><strong>User Info:</strong> {{ getUserInfo() }}</p>
              <button mat-button (click)="testApiConnection()" style="margin-top: 10px;">
                Testar Conexão API
              </button>
              <button mat-button (click)="checkAuthStatus()" style="margin-top: 10px; margin-left: 10px;">
                Verificar Auth
              </button>
            </div>
          </div>
        </div>

        <!-- Loading Template -->
        <ng-template #loadingTemplate>
          <div class="loading-container">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Carregando despesas...</p>
          </div>
        </ng-template>

        <!-- Pagination -->
        <mat-paginator *ngIf="paginatedResponse"
                       [length]="paginatedResponse.totalElements"
                       [pageSize]="pageSize"
                       [pageIndex]="currentPage"
                       [pageSizeOptions]="[5, 10, 25, 50]"
                       (page)="onPageChange($event)"
                       showFirstLastButtons>
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .expense-list-container {
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      
      .header-content {
        h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
          
          mat-icon {
            color: #ef4444;
            font-size: 32px;
          }
        }
        
        p {
          margin: 0;
          color: #64748b;
          font-size: 16px;
        }
      }
      
      .header-actions {
        button {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          color: white !important;
          border-radius: 8px !important;
          padding: 0 24px !important;
          height: 48px !important;
          font-weight: 600 !important;
          
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
      
      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 16px;
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          mat-icon {
            font-size: 24px;
            color: white;
          }
        }
        
        .stat-content {
          display: flex;
          flex-direction: column;
          
          .stat-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #1a202c;
            margin: 4px 0;
          }
          
          .stat-subtitle {
            font-size: 12px;
            color: #94a3b8;
          }
        }
        
        &.total .stat-icon {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        &.count .stat-icon {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }
        
        &.average .stat-icon {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
      }
    }

    .filters-card {
      margin-bottom: 24px;
      border-radius: 12px !important;
      
      .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        h3 {
          margin: 0;
          color: #1a202c;
          font-weight: 600;
        }
      }
      
      .filters-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
        
        .filter-field {
          width: 100%;
        }
      }
      
      .active-filters {
        border-top: 1px solid #e2e8f0;
        padding-top: 16px;
        
        .filters-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          margin-right: 12px;
        }
        
        mat-chip-set {
          margin-top: 8px;
        }
        
        mat-chip {
          background: #fef2f2 !important;
          color: #dc2626 !important;
          border: 1px solid #fecaca !important;
        }
      }
    }

    .table-card {
      border-radius: 12px !important;
      
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        h3 {
          margin: 0;
          color: #1a202c;
          font-weight: 600;
        }
      }
      
      .table-container {
        overflow-x: auto;
        
        .expense-table {
          width: 100%;
          
          .mat-mdc-header-cell {
            font-weight: 600;
            color: #374151;
            background: #f9fafb;
          }
          
          .expense-row {
            &:hover {
              background: #f8fafc;
            }
          }
          
          .date-cell {
            display: flex;
            flex-direction: column;
            
            .date {
              font-weight: 500;
              color: #1a202c;
            }
            
            .time {
              font-size: 12px;
              color: #64748b;
            }
          }
          
          .description-cell {
            display: flex;
            flex-direction: column;
            
            .description {
              font-weight: 500;
              color: #1a202c;
              margin-bottom: 2px;
            }
            
            .category {
              font-size: 12px;
              color: #64748b;
            }
          }
          
          .category-chip {
            background: #fef2f2 !important;
            color: #dc2626 !important;
            border: 1px solid #fecaca !important;
            font-size: 12px !important;
            height: 24px !important;
          }
          
          .expense-value {
            color: #dc2626;
            font-weight: 600;
            font-size: 16px;
          }
          
          .actions-header {
            text-align: center;
            width: 120px;
          }
          
          .actions-cell {
            text-align: center;
            
            button {
              margin: 0 2px;
              
              &.delete-button:hover {
                color: #dc2626;
              }
            }
          }
        }
      }
      
      .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: #64748b;
        
        mat-icon {
          font-size: 64px;
          color: #cbd5e1;
          margin-bottom: 16px;
        }
        
        h3 {
          margin: 0 0 8px 0;
          color: #374151;
        }
        
        p {
          margin: 0;
          
          a {
            color: #dc2626;
            cursor: pointer;
            text-decoration: underline;
            
            &:hover {
              color: #b91c1c;
            }
          }
        }
      }
      
      .loading-container {
        text-align: center;
        padding: 48px 24px;
        
        mat-spinner {
          margin: 0 auto 16px auto;
        }
        
        p {
          color: #64748b;
          margin: 0;
        }
      }
    }

    // Responsive
    @media (max-width: 768px) {
      .expense-list-container {
        padding: 16px;
      }
      
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        
        .header-actions {
          button {
            width: 100%;
          }
        }
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ExpenseListComponent implements OnInit, OnDestroy {
  
  private destroy$ = new Subject<void>();
  private searchSubject = new BehaviorSubject<string>('');

  // Data
  expenses: ExpenseResponse[] = [];
  categories: CategoryResponse[] = [];
  paginatedResponse: PaginatedResponse<ExpenseResponse> | null = null;
  
  // Filters
  filters: ExpenseFilters = {};
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  
  // UI State
  isLoading = false;
  displayedColumns = ['date', 'description', 'category', 'value', 'actions'];
  
  // Stats
  totalExpenses = 0;
  averageExpense = 0;

  constructor(
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    // private loadingService: LoadingService,
    private authService: AuthService,
    private router: Router
  ) {
    // Configurar busca com debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(search => {
      this.filters.search = search;
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.loadCategories();
    this.loadExpenses();
    this.loadTotalExpenses();
  }

  private loadCategories(): void {
    this.expenseService.getExpenseCategories()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar categorias:', error);
          this.notificationService.error('Erro ao carregar categorias');
          return of([]);
        })
      )
      .subscribe(categories => {
        this.categories = categories;
      });
  }

  private loadExpenses(): void {
    this.isLoading = true;
    
    this.expenseService.getAllExpenses({ 
      page: this.currentPage, 
      size: this.pageSize 
    })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar despesas:', error);
          this.notificationService.error('Erro ao carregar despesas');
          return of({} as PaginatedResponse<ExpenseResponse>);
        })
      )
      .subscribe(response => {
        this.isLoading = false;
        this.paginatedResponse = response;
        this.expenses = response.content || [];
        this.calculateStats();
      });
  }

  private loadTotalExpenses(): void {
    this.expenseService.getTotalExpense()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar total de despesas:', error);
          return of(0);
        })
      )
      .subscribe(total => {
        this.totalExpenses = total;
        this.calculateStats();
      });
  }

  private calculateStats(): void {
    if (this.expenses.length > 0) {
      const sum = this.expenses.reduce((acc, expense) => acc + expense.value, 0);
      this.averageExpense = sum / this.expenses.length;
    } else {
      this.averageExpense = 0;
    }
  }

  // Search and Filters
  onSearchChange(search: string): void {
    this.searchSubject.next(search);
  }

  onDateRangeChange(): void {
    if (this.startDate && this.endDate) {
      this.filters.startDate = this.formatDateForApi(this.startDate);
      this.filters.endDate = this.formatDateForApi(this.endDate);
      this.applyFilters();
    }
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadFilteredExpenses();
  }

  private loadFilteredExpenses(): void {
    this.isLoading = true;
    
    this.expenseService.getFilteredExpenses(this.filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao aplicar filtros:', error);
          this.notificationService.error('Erro ao aplicar filtros');
          return of([]);
        })
      )
      .subscribe(expenses => {
        this.isLoading = false;
        this.expenses = expenses;
        this.calculateStats();
      });
  }

  clearFilters(): void {
    this.filters = {};
    this.startDate = null;
    this.endDate = null;
    this.searchSubject.next('');
    this.loadExpenses();
  }

  removeFilter(filterType: string): void {
    switch (filterType) {
      case 'search':
        this.filters.search = undefined;
        this.searchSubject.next('');
        break;
      case 'categoryId':
        this.filters.categoryId = undefined;
        break;
      case 'dateRange':
        this.filters.startDate = undefined;
        this.filters.endDate = undefined;
        this.startDate = null;
        this.endDate = null;
        break;
    }
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.categoryId || this.filters.startDate);
  }

  // Pagination
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExpenses();
  }

  // Actions
  openExpenseForm(): void {
    this.router.navigate(['/dashboard/expenses/new']);
  }

  viewExpense(expense: ExpenseResponse): void {
    this.router.navigate(['/dashboard/expenses', expense.id]);
  }

  editExpense(expense: ExpenseResponse): void {
    this.router.navigate(['/dashboard/expenses', expense.id, 'edit']);
  }

  deleteExpense(expense: ExpenseResponse): void {
    if (confirm(`Tem certeza que deseja excluir a despesa "${expense.description}"?`)) {
      this.expenseService.deleteExpense(expense.id)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            console.error('Erro ao excluir despesa:', error);
            this.notificationService.error('Erro ao excluir despesa');
            return of('');
          })
        )
        .subscribe(result => {
          if (result) {
            this.notificationService.success('Despesa excluída com sucesso');
            this.loadExpenses();
            this.loadTotalExpenses();
          }
        });
    }
  }

  refreshExpenses(): void {
    this.loadExpenses();
    this.notificationService.info('Lista atualizada');
  }

  exportExpenses(): void {
    this.notificationService.info('Funcionalidade de exportação em desenvolvimento');
  }

  // Helpers
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  }

  formatCurrency(value: number): string {
    return this.expenseService.formatCurrency(value);
  }

  formatDate(date: string): string {
    return this.expenseService.formatDate(date);
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Debug methods
  getApiUrl(): string {
    return 'http://localhost:8080/api'; // ou pegar do environment
  }

  hasAuthToken(): boolean {
    return !!localStorage.getItem('planwise_token');
  }

  getUserInfo(): string {
    const token = localStorage.getItem('planwise_token');
    if (!token) return 'Não logado';
    
    try {
      // Decodificar JWT básico (apenas para debug)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.username || 'Token válido';
    } catch {
      return 'Token inválido';
    }
  }

  checkAuthStatus(): void {
    console.log('🔍 Verificando status de autenticação...');
    console.log('Token:', localStorage.getItem('planwise_token'));
    console.log('AuthService:', this.authService?.userName);
    
    this.notificationService.info(`User: ${this.getUserInfo()}`);
  }

  testApiConnection(): void {
    console.log('🔍 Testando conexão API...');
    console.log('API URL:', this.getApiUrl());
    console.log('Token:', this.hasAuthToken() ? 'Presente' : 'Ausente');
    console.log('Headers que serão enviados:', this.getHeaders());
    
    // Teste simples
    this.expenseService.getAllExpensesList().subscribe({
      next: (result) => {
        console.log('✅ API funcionando, despesas:', result);
        this.notificationService.success(`API OK! ${result.length} despesas encontradas`);
      },
      error: (error) => {
        console.error('❌ Erro API:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error completo:', error);
        this.notificationService.error(`Erro API: ${error.status} - ${error.message || 'Erro desconhecido'}`);
      }
    });
  }

  private getHeaders(): any {
    const token = localStorage.getItem('planwise_token');
    return token ? { 'Authorization': `Bearer ${token}` } : 'Sem token';
  }
}
