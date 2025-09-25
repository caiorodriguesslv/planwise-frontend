import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Services e Models
import { ExpenseService } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ExpenseResponse, CategoryResponse, ExpenseFilters, ExpenseStats } from '../../../core/models/expense.model';
import { PageRequest } from '../../../core/models/api.model';

@Component({
  selector: 'app-expense-list-v2',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="expense-list-container">
      <!-- Header principal -->
      <div class="page-header">
        <div class="page-title">
          <mat-icon class="page-icon">trending_down</mat-icon>
          <div class="title-content">
            <h1>Minhas Despesas</h1>
            <p>Gerencie e monitore todos os seus gastos</p>
          </div>
        </div>
        <button mat-raised-button color="primary" class="new-expense-btn" (click)="createNew()">
          <mat-icon>add</mat-icon>
          Nova Despesa
        </button>
      </div>

      <!-- Cards de estatísticas -->
      <div class="stats-cards">
        <mat-card class="stat-card red">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="stat-content">
              <h2>{{ (stats?.total || 0) | currency:'BRL':'symbol':'1.2-2' }}</h2>
              <p>Total de Despesas</p>
              <span class="stat-period">Este mês</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card blue">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>receipt_long</mat-icon>
            </div>
            <div class="stat-content">
              <h2>{{ totalElements || 0 }}</h2>
              <p>Total de Transações</p>
              <span class="stat-period">Despesas registradas</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card purple">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="stat-content">
              <h2>{{ (stats?.average || 0) | currency:'BRL':'symbol':'1.2-2' }}</h2>
              <p>Média por Despesa</p>
              <span class="stat-period">Valor médio</span>
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
            <button mat-button (click)="clearFilters()" [disabled]="getActiveFiltersCount() === 0">
              <mat-icon>clear</mat-icon>
              Limpar
            </button>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <div class="filter-grid">
              <mat-form-field appearance="outline" class="filter-search">
                <mat-label>Buscar despesas</mat-label>
                <input matInput 
                       formControlName="search" 
                       placeholder="Digite a descrição da despesa...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-category">
                <mat-label>Categoria</mat-label>
                <mat-select formControlName="categoryId" [disabled]="categories.length === 0">
                  <mat-option value="">
                    <span class="select-all-option">
                      <mat-icon>category</mat-icon>
                      {{ categories.length === 0 ? 'Nenhuma categoria disponível' : 'Todas as categorias' }}
                    </span>
                  </mat-option>
                  <mat-option *ngFor="let category of categories" [value]="category.id">
                    <span class="category-option">
                      <span class="category-color" [style.background-color]="category.color || '#ccc'"></span>
                      {{ category.name }}
                    </span>
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-date">
                <mat-label>Data inicial</mat-label>
                <input matInput 
                       [matDatepicker]="startPicker" 
                       formControlName="startDate">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-date">
                <mat-label>Data final</mat-label>
                <input matInput 
                       [matDatepicker]="endPicker" 
                       formControlName="endDate">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Tabela de despesas -->
      <mat-card class="table-card">
        <mat-card-content>
          <!-- Loading spinner -->
          <div *ngIf="isLoading" class="loading-container">
            <mat-progress-spinner mode="indeterminate" diameter="60"></mat-progress-spinner>
            <h3>Carregando despesas...</h3>
            <p>Por favor, aguarde enquanto buscamos seus dados.</p>
          </div>

          <!-- Tabela -->
          <div *ngIf="!isLoading" class="table-container">
            <table mat-table [dataSource]="expenses" class="expenses-table">
              <!-- Coluna Descrição -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let expense">
                  <div class="description-cell">
                    <strong>{{ expense.description }}</strong>
                    <small *ngIf="expense.category">{{ expense.category.name }}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Valor -->
              <ng-container matColumnDef="value">
                <th mat-header-cell *matHeaderCellDef>Valor</th>
                <td mat-cell *matCellDef="let expense">
                  <span class="expense-value">
                    {{ expense.value | currency:'BRL':'symbol':'1.2-2' }}
                  </span>
                </td>
              </ng-container>

              <!-- Coluna Data -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Data</th>
                <td mat-cell *matCellDef="let expense">
                  {{ expense.date | date:'dd/MM/yyyy' }}
                </td>
              </ng-container>

              <!-- Coluna Categoria -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Categoria</th>
                <td mat-cell *matCellDef="let expense">
                  <mat-chip *ngIf="expense.category" 
                           [style.background-color]="expense.category.color || '#e0e0e0'">
                    {{ expense.category.name }}
                  </mat-chip>
                  <span *ngIf="!expense.category" class="no-category">Sem categoria</span>
                </td>
              </ng-container>

              <!-- Coluna Ações -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Ações</th>
                <td mat-cell *matCellDef="let expense">
                  <button mat-icon-button (click)="viewExpense(expense)" matTooltip="Ver detalhes">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="editExpense(expense)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteExpense(expense)" 
                          matTooltip="Excluir" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Mensagem quando não há dados -->
            <div *ngIf="expenses.length === 0" class="no-data">
              <mat-icon>receipt_long</mat-icon>
              <h3>{{ getActiveFiltersCount() > 0 ? 'Nenhuma despesa encontrada para os filtros aplicados' : 'Nenhuma despesa cadastrada' }}</h3>
              <p>{{ getActiveFiltersCount() > 0 ? 'Tente ajustar os filtros de busca ou limpar todos os filtros.' : 'Comece criando sua primeira despesa para começar a controlar seus gastos.' }}</p>
              <div class="no-data-actions">
                <button *ngIf="getActiveFiltersCount() > 0" mat-button (click)="clearFilters()">
                  <mat-icon>clear</mat-icon>
                  Limpar Filtros
                </button>
                <button mat-raised-button color="primary" (click)="createNew()">
                  <mat-icon>add</mat-icon>
                  Nova Despesa
                </button>
              </div>
            </div>
          </div>

          <!-- Paginação -->
          <mat-paginator *ngIf="!isLoading && totalElements > 0"
                         [length]="totalElements"
                         [pageSize]="pageRequest.size"
                         [pageSizeOptions]="[5, 10, 20, 50]"
                         [pageIndex]="pageRequest.page"
                         (page)="onPageChange($event)"
                         showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>

      <!-- Debug info (remover em produção) -->
      <mat-card class="debug-card" *ngIf="showDebugInfo">
        <mat-card-header>
          <mat-card-title>🔧 Debug Info</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="debug-grid">
            <div><strong>Total:</strong> {{ totalElements }}</div>
            <div><strong>Página:</strong> {{ (pageRequest.page || 0) + 1 }} de {{ totalPages }}</div>
            <div><strong>Itens por página:</strong> {{ pageRequest.size }}</div>
            <div><strong>Filtros ativos:</strong> {{ getActiveFiltersCount() }}</div>
            <div><strong>Loading:</strong> {{ isLoading }}</div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .expense-list-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* Header principal */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 0 8px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .page-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #ef4444;
    }

    .title-content h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    .title-content p {
      margin: 4px 0 0 0;
      color: #64748b;
      font-size: 16px;
      font-weight: 400;
    }

    .new-expense-btn {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .new-expense-btn mat-icon {
      margin-right: 8px;
    }

    /* Cards de estatísticas */
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border: none;
      overflow: hidden;
      transition: all 0.3s ease;
      position: relative;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    }

    .stat-card.red {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }

    .stat-card.blue {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    .stat-card.purple {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 24px;
      gap: 20px;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: white;
      line-height: 1.1;
    }

    .stat-content p {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }

    .stat-period {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 400;
    }

    /* Cards gerais */
    .filters-card, .table-card, .debug-card {
      margin-bottom: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border: none;
    }

    /* Filtros */
    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px 0 24px;
    }

    .filters-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .filters-header mat-icon {
      color: #64748b;
    }

    .filters-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .active-filters {
      background: #dbeafe;
      color: #2563eb;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .filters-form {
      margin: 0;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 20px;
      align-items: start;
    }

    .filter-search {
      grid-column: 1;
    }

    .filter-category {
      grid-column: 2;
    }

    .filter-date {
      grid-column: span 1;
    }

    /* Opções do select */
    .select-all-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-option {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 40px;
      text-align: center;
    }

    .loading-container h3 {
      margin: 20px 0 10px 0;
      color: #1976d2;
    }

    .loading-container p {
      margin: 0;
      color: #666;
      font-size: 0.9em;
    }

    .table-container {
      overflow-x: auto;
    }

    .expenses-table {
      width: 100%;
    }

    .description-cell {
      display: flex;
      flex-direction: column;
    }

    .description-cell small {
      color: #666;
      font-size: 0.8em;
    }

    .expense-value {
      font-weight: 500;
      color: #d32f2f;
    }

    .no-category {
      color: #999;
      font-style: italic;
    }

    .no-data {
      text-align: center;
      padding: 80px 20px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      margin-bottom: 24px;
      color: #ddd;
    }

    .no-data h3 {
      margin: 20px 0 15px 0;
      color: #424242;
      font-weight: 500;
    }

    .no-data p {
      margin-bottom: 30px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.5;
    }

    .no-data-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .debug-card {
      background: #fff3e0;
      border: 1px solid #ffb74d;
    }

    .debug-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }

    /* Responsividade */
    @media (max-width: 1024px) {
      .stats-cards {
        grid-template-columns: 1fr 1fr;
      }
      
      .filter-grid {
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      
      .filter-search {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 768px) {
      .expense-list-container {
        padding: 16px;
      }
      
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        text-align: center;
      }
      
      .page-title {
        justify-content: center;
      }
      
      .title-content h1 {
        font-size: 28px;
      }
      
      .stats-cards {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .filter-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }
      
      .stat-card mat-card-content {
        padding: 20px;
      }
      
      .stat-content h2 {
        font-size: 24px;
      }
    }

    @media (max-width: 480px) {
      .expense-list-container {
        padding: 12px;
      }
      
      .page-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
      
      .title-content h1 {
        font-size: 24px;
      }
      
      .title-content p {
        font-size: 14px;
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
      }
      
      .stat-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
  `]
})
export class ExpenseListV2Component implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado do componente
  expenses: ExpenseResponse[] = [];
  categories: CategoryResponse[] = [];
  stats: ExpenseStats | null = null;
  isLoading = false;
  showDebugInfo = false;

  // Paginação
  pageRequest: PageRequest = { page: 0, size: 10 };
  totalElements = 0;
  totalPages = 0;

  // Colunas da tabela
  displayedColumns: string[] = ['description', 'value', 'date', 'category', 'actions'];

  // Form de filtros
  filterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {
    // console.log('🎉 ExpenseListV2Component inicializado');

    // Inicializar form de filtros
    this.filterForm = this.fb.group({
      search: [''],
      categoryId: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit() {
    // Setup de filtros reativos
    this.setupFilterSubscriptions();
    
    // Carregar dados iniciais
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterSubscriptions() {
    // Reagir a mudanças nos filtros
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.pageRequest.page = 0; // Reset página ao filtrar
        this.loadExpenses();
      });
  }

  private loadInitialData() {
    // Carregar categorias
    this.loadCategories();
    
    // Carregar despesas
    this.loadExpenses();
    
    // Carregar estatísticas
    this.loadStats();
  }

  private loadCategories() {
    this.expenseService.getExpenseCategories()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar categorias:', error);
          this.notificationService.error('Erro ao carregar categorias');
          return of([]);
        })
      )
      .subscribe((categories: CategoryResponse[]) => {
        this.categories = categories;
        // console.log('✅ Categorias carregadas:', categories.length);
      });
  }

  private loadExpenses() {
    this.isLoading = true;
    
    const filters = this.buildFilters();
    
    this.expenseService.getAllExpenses(this.pageRequest)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar despesas:', error);
          this.notificationService.error('Erro ao carregar despesas');
          this.isLoading = false;
          return of({ content: [], totalElements: 0, totalPages: 0 });
        })
      )
      .subscribe((response: any) => {
        this.expenses = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
        
        // console.log('✅ Despesas carregadas:', this.expenses.length, 'itens');
      });
  }

  private loadStats() {
    const filters = this.buildFilters();
    
    this.expenseService.getExpenseStats(filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar estatísticas:', error);
          return of(null);
        })
      )
      .subscribe(stats => {
        this.stats = stats;
        // console.log('✅ Estatísticas carregadas:', stats);
      });
  }

  private buildFilters(): ExpenseFilters {
    const formValue = this.filterForm.value;
    const filters: ExpenseFilters = {};

    if (formValue.search?.trim()) {
      filters.search = formValue.search.trim();
    }

    if (formValue.categoryId) {
      filters.categoryId = formValue.categoryId;
    }

    if (formValue.startDate) {
      filters.startDate = formValue.startDate;
    }

    if (formValue.endDate) {
      filters.endDate = formValue.endDate;
    }

    return filters;
  }

  // Event handlers
  onPageChange(event: PageEvent) {
    this.pageRequest.page = event.pageIndex;
    this.pageRequest.size = event.pageSize;
    this.loadExpenses();
  }

  clearFilters() {
    this.filterForm.reset();
    this.pageRequest.page = 0;
    this.loadExpenses();
    this.loadStats();
  }

  createNew() {
    this.notificationService.info('Funcionalidade "Nova Despesa" será implementada em breve');
  }

  viewExpense(expense: ExpenseResponse) {
    this.notificationService.info(`Ver detalhes da despesa: ${expense.description}`);
  }

  editExpense(expense: ExpenseResponse) {
    this.notificationService.info(`Editar despesa: ${expense.description}`);
  }

  deleteExpense(expense: ExpenseResponse) {
    this.notificationService.warning(`Confirmar exclusão da despesa: ${expense.description}`);
  }

  getActiveFiltersCount(): number {
    const formValue = this.filterForm.value;
    let count = 0;
    
    if (formValue.search?.trim()) count++;
    if (formValue.categoryId) count++;
    if (formValue.startDate) count++;
    if (formValue.endDate) count++;
    
    return count;
  }
}
