import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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
import { ExpenseResponse, ExpenseFilters, ExpenseStats } from '../../../core/models/expense.model';
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
    <!-- Dashboard Content -->
    <div class="dashboard-content">
      
      <!-- Header principal -->
      <div class="page-header">
        <div class="page-title">
          <div class="page-icon">
            <mat-icon>trending_down</mat-icon>
          </div>
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

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card expense">
          <div class="stat-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Total de Despesas</h3>
            <p class="amount">{{ stats.total | currency:'BRL':'symbol':'1.2-2' }}</p>
            <span class="subtitle">Este mês</span>
          </div>
        </div>

        <div class="stat-card income">
          <div class="stat-icon">
            <mat-icon>receipt_long</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Total de Transações</h3>
            <p class="amount">{{ totalElements || 0 }}</p>
            <span class="subtitle">Despesas registradas</span>
          </div>
        </div>

        <div class="stat-card balance">
          <div class="stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Média por Despesa</h3>
            <p class="amount">{{ stats.average | currency:'BRL':'symbol':'1.2-2' }}</p>
            <span class="subtitle">Valor médio</span>
          </div>
        </div>
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
                <mat-label>Buscar despesas</mat-label>
                <input matInput 
                       formControlName="search" 
                       placeholder="Digite a descrição da despesa...">
                <mat-icon matSuffix>search</mat-icon>
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

          <!-- Tabela ou Estado Vazio -->
          <div *ngIf="!isLoading" class="table-container">
            <!-- Tabela de dados -->
            <div *ngIf="expenses.length > 0" class="data-table">
              <table mat-table [dataSource]="expenses" class="expenses-table">
                <!-- Coluna Descrição -->
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef class="description-header">Descrição</th>
                  <td mat-cell *matCellDef="let expense" class="description-cell">
                    <div class="description-content">
                      <strong>{{ expense.description }}</strong>
                    </div>
                  </td>
                </ng-container>

                <!-- Coluna Valor -->
                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef class="value-header">Valor</th>
                  <td mat-cell *matCellDef="let expense" class="value-cell">
                    <span class="expense-value">
                      {{ expense.value | currency:'BRL':'symbol':'1.2-2' }}
                    </span>
                  </td>
                </ng-container>

                <!-- Coluna Data -->
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef class="date-header">Data</th>
                  <td mat-cell *matCellDef="let expense" class="date-cell">
                    {{ expense.date | date:'dd/MM/yyyy' }}
                  </td>
                </ng-container>

                <!-- Coluna Categoria -->
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef class="category-header">Categoria</th>
                  <td mat-cell *matCellDef="let expense" class="category-cell">
                    <mat-chip *ngIf="expense.category" 
                             [class]="'category-chip ' + (expense.category.type === 'RECEITA' ? 'receita' : 'despesa')"
                             class="category-chip">
                      {{ expense.category.name }}
                    </mat-chip>
                    <span *ngIf="!expense.category" class="no-category">Sem categoria</span>
                  </td>
                </ng-container>

                <!-- Coluna Ações -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="actions-header">Ações</th>
                  <td mat-cell *matCellDef="let expense" class="actions-cell">
                    <div class="action-buttons">
                      <button mat-icon-button (click)="viewExpense(expense)" matTooltip="Ver detalhes" class="action-btn view">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button (click)="editExpense(expense)" matTooltip="Editar" class="action-btn edit">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="deleteExpense(expense)" matTooltip="Excluir" class="action-btn delete">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns" class="table-header"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
              </table>
            </div>

            <!-- Estado vazio melhorado -->
            <div *ngIf="expenses.length === 0" class="empty-state">
              <div class="empty-state-content">
                <div class="empty-icon">
                  <mat-icon>receipt_long</mat-icon>
                </div>
                <h3>{{ getActiveFiltersCount() > 0 ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa cadastrada' }}</h3>
                <p>{{ getActiveFiltersCount() > 0 ? 'Tente ajustar os filtros de busca ou limpar todos os filtros.' : 'Comece criando sua primeira despesa para começar a controlar seus gastos.' }}</p>
                <div class="empty-actions">
                  <button *ngIf="getActiveFiltersCount() > 0" mat-stroked-button (click)="clearFilters()" class="clear-btn">
                    <mat-icon>clear</mat-icon>
                    Limpar Filtros
                  </button>
                  <button mat-raised-button color="primary" (click)="createNew()" class="create-btn">
                    <mat-icon>add</mat-icon>
                    Nova Despesa
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
  styleUrls: ['./expense-list-v2.component.scss']
})
export class ExpenseListV2Component implements OnInit, OnDestroy {
  // Dados
  expenses: ExpenseResponse[] = [];
  stats: ExpenseStats = { total: 0, average: 0, count: 0 };

  // Paginação
  totalElements = 0;
  totalPages = 0;
  pageRequest: PageRequest = { page: 0, size: 10 };
  
  // Filtros
  filterForm: FormGroup;
  
  // Estados
  isLoading = false;
  showDebugInfo = false;

  // Colunas da tabela
  displayedColumns: string[] = ['description', 'value', 'date', 'category', 'actions'];

  // Controle de ciclo de vida
  private destroy$ = new Subject<void>();

  constructor(
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadExpenses();
    this.loadStats();
    this.setupFilterSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterSubscriptions(): void {
    // Observar mudanças nos filtros
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageRequest.page = 0; // Reset para primeira página
        this.loadExpenses();
      });
  }

  private loadExpenses(): void {
    this.isLoading = true;
    
    const filters: ExpenseFilters = {
      search: this.filterForm.get('search')?.value || undefined,
      startDate: this.filterForm.get('startDate')?.value || undefined,
      endDate: this.filterForm.get('endDate')?.value || undefined
    };

    this.expenseService.getAllExpenses(this.pageRequest, filters)
      .pipe(
        catchError((error: any) => {
          console.error('Erro ao carregar despesas:', error);
            this.notificationService.error('Erro ao carregar despesas');
          return of({ content: [], totalElements: 0, totalPages: 0 });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response: any) => {
        this.expenses = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  private loadStats(): void {
    this.expenseService.getExpenseStats()
      .pipe(
        catchError((error: any) => {
          console.error('Erro ao carregar estatísticas:', error);
          return of({ total: 0, average: 0, count: 0 });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(stats => {
        this.stats = stats;
        this.cdr.detectChanges();
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageRequest.page = event.pageIndex;
    this.pageRequest.size = event.pageSize;
    this.loadExpenses();
  }

  createNew(): void {
    this.router.navigate(['/dashboard/expenses/new']);
  }

  clearFilters(): void {
    this.filterForm.reset();
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
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Despesa excluída com sucesso!');
            this.loadExpenses(); // Recarregar a lista
            this.loadStats(); // Recarregar estatísticas
          },
          error: (error) => {
            console.error('Erro ao excluir despesa:', error);
            this.notificationService.error('Erro ao excluir despesa');
          }
        });
    }
  }

  getActiveFiltersCount(): number {
    const formValue = this.filterForm.getRawValue();
    let count = 0;
    
    if (formValue.search?.trim()) count++;
    if (formValue.startDate) count++;
    if (formValue.endDate) count++;
    
    return count;
  }
}