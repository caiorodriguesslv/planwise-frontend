import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
              <h2>{{ stats.total | currency:'BRL':'symbol':'1.2-2' }}</h2>
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
              <h2>{{ stats.average | currency:'BRL':'symbol':'1.2-2' }}</h2>
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

              <mat-form-field appearance="outline" class="filter-category">
                <mat-label>Categoria</mat-label>
                <mat-select formControlName="categoryId">
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
                      <small *ngIf="expense.category">{{ expense.category.name }}</small>
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
                             [style.background-color]="expense.category.color || '#e0e0e0'"
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

    .filters-actions button.disabled {
      opacity: 0.5;
      pointer-events: none;
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
      min-height: 400px;
      display: flex;
      flex-direction: column;
    }

    .data-table {
      flex: 1;
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      background: white;
    }

    .expenses-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    /* Headers da tabela */
    .table-header {
      background: #f8fafc;
      border-bottom: 2px solid #e5e7eb;
    }

    .description-header {
      width: 35%;
      padding: 16px 24px;
      font-weight: 600;
      color: #374151;
    }

    .value-header {
      width: 15%;
      padding: 16px 24px;
      font-weight: 600;
      color: #374151;
      text-align: right;
    }

    .date-header {
      width: 15%;
      padding: 16px 24px;
      font-weight: 600;
      color: #374151;
    }

    .category-header {
      width: 20%;
      padding: 16px 24px;
      font-weight: 600;
      color: #374151;
    }

    .actions-header {
      width: 15%;
      padding: 16px 24px;
      font-weight: 600;
      color: #374151;
      text-align: center;
    }

    /* Células da tabela */
    .table-row {
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background-color: #f9fafb;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .description-cell {
      padding: 16px 24px;
    }

    .description-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .description-content strong {
      color: #111827;
      font-weight: 600;
    }

    .description-content small {
      color: #6b7280;
      font-size: 0.85em;
    }

    .value-cell {
      padding: 16px 24px;
      text-align: right;
    }

    .expense-value {
      font-weight: 600;
      color: #dc2626;
      font-size: 1.05em;
    }

    .date-cell {
      padding: 16px 24px;
      color: #4b5563;
      font-weight: 500;
    }

    .category-cell {
      padding: 16px 24px;
    }

    .category-chip {
      color: white;
      font-weight: 500;
      font-size: 0.8em;
    }

    .no-category {
      color: #9ca3af;
      font-style: italic;
      font-size: 0.9em;
    }

    .actions-cell {
      padding: 16px 24px;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 4px;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      transition: all 0.2s ease;
    }

    .action-btn.view {
      color: #3b82f6;
    }

    .action-btn.view:hover {
      background-color: #dbeafe;
    }

    .action-btn.edit {
      color: #f59e0b;
    }

    .action-btn.edit:hover {
      background-color: #fef3c7;
    }

    .action-btn.delete {
      color: #ef4444;
    }

    .action-btn.delete:hover {
      background-color: #fee2e2;
    }

    /* Estado vazio melhorado */
    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      background: white;
      border-radius: 12px;
      border: 1px dashed #d1d5db;
    }

    .empty-state-content {
      text-align: center;
      max-width: 480px;
      padding: 40px;
    }

    .empty-icon {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .empty-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #9ca3af;
    }

    .empty-state h3 {
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
      color: #374151;
    }

    .empty-state p {
      margin: 0 0 32px 0;
      color: #6b7280;
      line-height: 1.6;
      font-size: 16px;
    }

    .empty-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .clear-btn {
      border-color: #d1d5db;
      color: #6b7280;
    }

    .clear-btn:hover {
      background-color: #f9fafb;
      border-color: #9ca3af;
    }

    .create-btn {
      padding: 12px 24px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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

      /* Tabela responsiva */
      .data-table {
        overflow-x: auto;
      }

      .description-header, .description-cell {
        width: auto;
        min-width: 200px;
      }

      .value-header, .value-cell {
        width: auto;
        min-width: 120px;
      }

      .date-header, .date-cell {
        width: auto;
        min-width: 100px;
      }

      .category-header, .category-cell {
        width: auto;
        min-width: 140px;
      }

      .actions-header, .actions-cell {
        width: auto;
        min-width: 120px;
      }

      .empty-state-content {
        padding: 32px 20px;
      }

      .empty-icon {
        width: 100px;
        height: 100px;
        margin-bottom: 24px;
      }

      .empty-icon mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      .empty-state h3 {
        font-size: 20px;
      }

      .empty-actions {
        flex-direction: column;
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
  stats: ExpenseStats = {
    total: 0,
    count: 0,
    average: 0
  };
  isLoading = false;
  showDebugInfo = false;

  // Paginação
  pageRequest: PageRequest = { 
    page: 0, 
    size: 10
  };
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
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    // console.log('🎉 ExpenseListV2Component inicializado');

    // Inicializar form de filtros
    this.filterForm = this.fb.group({
      search: [''],
      categoryId: [{ value: '', disabled: true }], // Inicialmente disabled até carregar categorias
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
        
        // Controlar estado disabled do campo categoria
        const categoryControl = this.filterForm.get('categoryId');
        if (categories.length === 0) {
          categoryControl?.disable();
        } else {
          categoryControl?.enable();
        }
        
        // console.log('✅ Categorias carregadas:', categories.length);
      });
  }

  private loadExpenses() {
    this.isLoading = true;
    
    // Verificar se o usuário está autenticado
    if (!this.authService.isLoggedIn) {
      console.warn('⚠️ Usuário não autenticado, não carregando despesas');
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    
    const filters = this.buildFilters();
    
    // Tentar primeiro o endpoint com paginação (original)
    this.expenseService.getAllExpenses(this.pageRequest)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar despesas:', error);
          
          // Se for erro 401/403, pode ser problema de autenticação
          if (error.status === 401 || error.status === 403) {
            console.warn('🔐 Problema de autenticação detectado');
            this.notificationService.warning('Sessão expirada. Faça login novamente.');
          } else if (error.status === 500) {
            console.error('🚨 Erro interno do servidor:', error);
            this.notificationService.error('Erro interno do servidor. Tente novamente.');
          } else {
            this.notificationService.error('Erro ao carregar despesas');
          }
          
          this.isLoading = false;
          return of({ content: [], totalElements: 0, totalPages: 0 });
        })
      )
      .subscribe((response: any) => {
        this.expenses = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
        
        console.log('✅ Despesas carregadas:', this.expenses.length, 'itens');
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
        this.stats = stats || {
          total: 0,
          count: 0,
          average: 0
        };
        this.cdr.detectChanges();
        // console.log('✅ Estatísticas carregadas:', stats);
      });
  }

  private buildFilters(): ExpenseFilters {
    // Usar getRawValue() para incluir campos disabled
    const formValue = this.filterForm.getRawValue();
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
    // Emitir evento para o dashboard mudar para o módulo de nova despesa
    window.dispatchEvent(new CustomEvent('navigate-to-module', { 
      detail: { module: 'nova-despesa' } 
    }));
    this.notificationService.info('Carregando formulário de nova despesa...');
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
    const formValue = this.filterForm.getRawValue();
    let count = 0;
    
    if (formValue.search?.trim()) count++;
    if (formValue.categoryId) count++;
    if (formValue.startDate) count++;
    if (formValue.endDate) count++;
    
    return count;
  }
}
