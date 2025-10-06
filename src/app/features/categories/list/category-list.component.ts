import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    <!-- Dashboard Content -->
    <div class="dashboard-content">
      
      <!-- Header principal -->
      <div class="page-header">
        <div class="page-title">
          <div class="page-icon">
            <mat-icon>category</mat-icon>
          </div>
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

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <mat-icon>category</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Total de Categorias</h3>
            <p class="amount">{{ stats.total }}</p>
            <span class="subtitle">Ativas</span>
          </div>
        </div>

        <div class="stat-card income">
          <div class="stat-icon">
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Receitas</h3>
            <p class="amount">{{ stats.byType.receitas }}</p>
            <span class="subtitle">Categorias de entrada</span>
          </div>
        </div>

        <div class="stat-card expense">
          <div class="stat-icon">
            <mat-icon>trending_down</mat-icon>
          </div>
          <div class="stat-info">
            <h3>Despesas</h3>
            <p class="amount">{{ stats.byType.despesas }}</p>
            <span class="subtitle">Categorias de saída</span>
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
                <mat-label>Buscar categorias</mat-label>
                <input matInput 
                       formControlName="search" 
                       placeholder="Digite o nome da categoria...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-type">
                <mat-label>Tipo da categoria</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="">
                    <span class="select-option">
                      <mat-icon>filter_list</mat-icon>
                      Todos os tipos
                    </span>
                  </mat-option>
                  <mat-option value="RECEITA">
                    <span class="select-option income">
                      <mat-icon>trending_up</mat-icon>
                      Receita
                    </span>
                  </mat-option>
                  <mat-option value="DESPESA">
                    <span class="select-option expense">
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
            <h3 class="planwise-text-primary">Carregando categorias...</h3>
            <p class="planwise-text-muted">Por favor, aguarde enquanto buscamos seus dados.</p>
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

            <!-- Estado vazio -->
            <div *ngIf="categories.length === 0" class="empty-state">
              <div class="empty-content">
                <div class="empty-icon">
                  <mat-icon [class.filter-icon]="getActiveFiltersCount() > 0">
                    {{ getActiveFiltersCount() > 0 ? 'filter_list' : 'category' }}
                  </mat-icon>
                </div>

                <div class="empty-text">
                  <h3>
                    {{ getActiveFiltersCount() > 0 ? 'Nenhum resultado encontrado' : 'Nenhuma categoria cadastrada' }}
                  </h3>
                  <p>
                    {{ getActiveFiltersCount() > 0 ? 
                      'Não encontramos nenhuma categoria com os filtros selecionados.' : 
                      'Organize suas finanças criando categorias para suas receitas e despesas.' }}
                  </p>
                </div>

                <div class="empty-actions">
                  <button *ngIf="getActiveFiltersCount() > 0"
                          mat-stroked-button
                          (click)="clearFilters()"
                          class="clear-filters-button">
                    <mat-icon>refresh</mat-icon>
                    Limpar Filtros
                  </button>
                  
                  <button mat-flat-button
                          (click)="createNew()"
                          class="new-category-button">
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
    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      min-height: calc(100vh - 80px);
      position: relative;
      border-radius: 20px;
      padding: 24px;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(255, 167, 38, 0.05) 0%, transparent 50%);
        pointer-events: none;
        border-radius: 20px;
      }
    }

    /* Header - Baseado no Dashboard */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 32px;
      
      .page-title {
        display: flex;
        align-items: center;
        gap: 20px;
        
        .page-icon {
          width: 60px;
          height: 60px;
          font-size: 32px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--planwise-purple), var(--planwise-purple-dark));
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5);
          position: relative;
          transition: all 0.3s ease;
          
          &::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
            border-radius: 18px;
            z-index: -1;
          }
          
          mat-icon {
            color: white !important;
            font-size: 32px !important;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          }
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(139, 92, 246, 0.6);
          }
        }
        
        .title-content {
          h1 {
            margin: 0 0 4px 0;
            font-size: 28px;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          p {
            margin: 0;
            font-size: 15px;
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
      
      .new-category-btn {
        background: linear-gradient(135deg, var(--planwise-purple), var(--planwise-purple-dark)) !important;
        color: white !important;
        padding: 12px 24px;
        font-weight: 600;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
        
        mat-icon {
          margin-right: 8px;
        }
        
        &:hover {
          background: linear-gradient(135deg, var(--planwise-purple-dark), #6d28d9) !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5);
        }
      }
    }

    /* Stats Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;

      .stat-card {
        background: linear-gradient(135deg, var(--planwise-bg-secondary) 0%, var(--planwise-bg-tertiary) 100%);
        border-radius: 20px;
        padding: 28px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        gap: 20px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          pointer-events: none;
        }
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        }
        
        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
            border-radius: 18px;
            z-index: -1;
          }
          
          mat-icon {
            font-size: 32px;
            color: white;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          }
        }
        
        .stat-info {
          h3 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
          }
          
          .amount {
            margin: 0 0 2px 0;
            font-size: 24px;
            font-weight: 700;
            color: white;
          }
          
          .subtitle {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
          }
        }
        
        &.total .stat-icon {
          background: linear-gradient(135deg, var(--planwise-purple), var(--planwise-purple-dark));
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }
        
        &.income .stat-icon {
          background: linear-gradient(135deg, var(--planwise-cyan), var(--planwise-cyan-dark));
          box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
        }
        
        &.expense .stat-icon {
          background: linear-gradient(135deg, var(--planwise-red), var(--planwise-red-dark));
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        }
      }
    }

    /* Filtros - Baseado no Dashboard */
    .filters-card {
      margin-bottom: 40px;
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(135deg, var(--planwise-bg-secondary) 0%, var(--planwise-bg-tertiary) 100%);
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
        pointer-events: none;
      }
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 28px 32px 20px 32px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 1;
    }

    .filters-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
      font-weight: 700;
      color: white;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .filters-header mat-card-title mat-icon {
      font-size: 24px;
      color: var(--planwise-purple);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .filters-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .active-filters {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(139, 92, 246, 0.2);
      padding: 4px 8px;
      border-radius: 12px;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }

    .filters-actions button {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }

    .filters-actions button:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }

    .filters-actions button.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .filters-form {
      padding: 20px 24px 24px 24px;
      
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        align-items: end;
      }
    }

    .filter-search {
      grid-column: span 2;
    }

    .filter-type {
      min-width: 200px;
    }

    /* Tabela - Baseado no Dashboard */
    .table-card {
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(135deg, var(--planwise-bg-secondary) 0%, var(--planwise-bg-tertiary) 100%);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

    .table-container {
      overflow-x: auto;
    }

    /* Search Filters */
    .search-filters {
      background: #1c2029;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;

      .filters-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        
        mat-icon {
          color: rgba(255, 255, 255, 0.7);
          margin-right: 12px;
        }

        span {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          font-weight: 500;
          flex: 1;
        }

        .clear-filters-btn {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;

          mat-icon {
            font-size: 18px;
            margin-right: 4px;
          }

          &:hover {
            color: rgba(255, 255, 255, 0.9);
          }
        }
      }

      .filters-content {
        .filters-form {
          .filter-group {
            display: flex;
            gap: 16px;

            .search-field {
              flex: 2;

              .search-input-wrapper {
                display: flex;
                align-items: center;

                mat-icon {
                  margin-right: 8px;
                  color: rgba(255, 255, 255, 0.5);
                }

                input {
                  color: white;
                }
              }
            }

            .type-field {
              flex: 1;

              .select-option {
                display: flex;
                align-items: center;
                gap: 8px;

                mat-icon {
                  font-size: 18px;
                }

                &.income mat-icon {
                  color: #00BCD4;
                }

                &.expense mat-icon {
                  color: #FF5252;
                }
              }
            }
          }
        }
      }
    }

    /* Table */
    .table-card {
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 20px;
        text-align: center;
        
        h3 {
          margin: 16px 0 8px 0;
          color: white;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
        }
      }
      
      .categories-table {
        width: 100%;
        
        .table-header {
          background: rgba(255, 255, 255, 0.1);
          
          th {
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            font-weight: 600;
            color: white;
            padding: 16px 12px;
          }
        }
        
        .table-row {
          transition: background-color 0.2s ease;
          
          &:hover {
            background: rgba(255, 255, 255, 0.05);
          }
          
          td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
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
      padding: 48px 24px;

      .empty-content {
        max-width: 420px;
        text-align: center;

        .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;

          mat-icon {
            font-size: 36px;
            width: 36px;
            height: 36px;
            color: rgba(255, 255, 255, 0.5);

            &.filter-icon {
              color: #8b5cf6;
            }
          }
        }

        .empty-text {
          margin-bottom: 32px;

          h3 {
            font-size: 20px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            margin: 0 0 12px;
          }

          p {
            font-size: 15px;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
          }
        }

        .empty-actions {
          display: flex;
          gap: 16px;
          justify-content: center;

          .clear-filters-button {
            color: rgba(255, 255, 255, 0.7);
            border-color: rgba(255, 255, 255, 0.2);

            mat-icon {
              margin-right: 8px;
            }

            &:hover {
              background: rgba(255, 255, 255, 0.05);
              border-color: rgba(255, 255, 255, 0.3);
              color: rgba(255, 255, 255, 0.9);
            }
          }

          .new-category-button {
            background: #8b5cf6;
            color: white;

            mat-icon {
              margin-right: 8px;
            }

            &:hover {
              background: #7c3aed;
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            }
          }
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
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router
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
    
    // Debug: Log para verificar o que está sendo enviado
    console.log('Loading categories with:', { pageRequest: this.pageRequest, filters });
    
    this.categoryService.getCategories(this.pageRequest, filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading categories:', error);
          this.notificationService.error('Erro ao carregar categorias');
          this.isLoading = false;
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
        console.log('Categories loaded:', response);
        this.categories = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.isLoading = false;
        
        // Forçar detecção de mudanças
        this.cdr.detectChanges();
        console.log('Categories after update:', this.categories);
        console.log('Is loading:', this.isLoading);
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
        this.cdr.detectChanges();
        console.log('Stats loaded:', this.stats);
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
    // Navegar diretamente para o formulário de nova categoria
    this.router.navigate(['/dashboard/categories/new']);
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
