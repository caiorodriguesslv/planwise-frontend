import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ExpenseService } from '../../../core/services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ExpenseResponse } from '../../../core/models/expense.model';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <div class="expense-detail-container">
      <!-- Header -->
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>
            <mat-icon>visibility</mat-icon>
            Detalhes da Despesa
          </h1>
          <p>Informações completas sobre a despesa selecionada</p>
        </div>
        <div class="header-actions" *ngIf="expense">
          <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Mais opções">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="editExpense()">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-menu-item (click)="deleteExpense()">
              <mat-icon>delete</mat-icon>
              Excluir
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="refreshExpense()">
              <mat-icon>refresh</mat-icon>
              Atualizar
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Content -->
      <div class="content" *ngIf="!isLoading && expense; else loadingTemplate">
        
        <!-- Main Information Card -->
        <mat-card class="main-info-card">
          <div class="card-header">
            <div class="title-section">
              <h2>{{ expense.description }}</h2>
              <mat-chip class="category-chip">
                <mat-icon>category</mat-icon>
                {{ expense.category.name }}
              </mat-chip>
            </div>
            <div class="value-section">
              <span class="value-label">Valor</span>
              <span class="value-amount">{{ formatCurrency(expense.value) }}</span>
            </div>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="card-content">
            <div class="info-grid">
              <!-- Date Information -->
              <div class="info-section">
                <h3>
                  <mat-icon>event</mat-icon>
                  Datas
                </h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">Data da Despesa:</span>
                    <span class="value">{{ formatDate(expense.date) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Criado em:</span>
                    <span class="value">{{ formatDateTime(expense.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Category Information -->
              <div class="info-section">
                <h3>
                  <mat-icon>category</mat-icon>
                  Categoria
                </h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">Nome:</span>
                    <span class="value">{{ expense.category.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Tipo:</span>
                    <span class="value">{{ expense.category.type }}</span>
                  </div>
                </div>
              </div>

              <!-- Status Information -->
              <div class="info-section">
                <h3>
                  <mat-icon>info</mat-icon>
                  Status
                </h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">ID:</span>
                    <span class="value">#{{ expense.id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Status:</span>
                    <mat-chip [class]="expense.active ? 'status-active' : 'status-inactive'">
                      <mat-icon>{{ expense.active ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ expense.active ? 'Ativo' : 'Inativo' }}
                    </mat-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-card>

        <!-- Actions Card -->
        <mat-card class="actions-card">
          <div class="actions-header">
            <h3>Ações</h3>
          </div>
          <div class="actions-content">
            <button mat-raised-button color="primary" (click)="editExpense()">
              <mat-icon>edit</mat-icon>
              Editar Despesa
            </button>
            
            <button mat-stroked-button (click)="duplicateExpense()">
              <mat-icon>content_copy</mat-icon>
              Duplicar
            </button>
            
            <button mat-stroked-button color="warn" (click)="deleteExpense()">
              <mat-icon>delete</mat-icon>
              Excluir
            </button>
          </div>
        </mat-card>

        <!-- History Card -->
        <mat-card class="history-card">
          <div class="card-header">
            <h3>
              <mat-icon>history</mat-icon>
              Histórico
            </h3>
          </div>
          <div class="history-content">
            <div class="history-item">
              <div class="history-icon">
                <mat-icon>add_circle</mat-icon>
              </div>
              <div class="history-details">
                <div class="history-title">Despesa criada</div>
                <div class="history-time">{{ formatDateTime(expense.createdAt) }}</div>
              </div>
            </div>
            
            <!-- Placeholder for future history items -->
            <div class="history-placeholder">
              <mat-icon>info</mat-icon>
              <span>Histórico de modificações será exibido aqui</span>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Loading Template -->
      <ng-template #loadingTemplate>
        <div class="loading-container">
          <mat-spinner diameter="60"></mat-spinner>
          <p>Carregando detalhes da despesa...</p>
        </div>
      </ng-template>

      <!-- Error State -->
      <div class="error-state" *ngIf="!isLoading && !expense">
        <mat-icon>error_outline</mat-icon>
        <h3>Despesa não encontrada</h3>
        <p>A despesa que você está procurando não existe ou foi removida.</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Voltar à Lista
        </button>
      </div>
    </div>
  `,
  styles: [`
    .expense-detail-container {
      padding: 32px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 32px;
      
      .back-button {
        margin-top: 8px;
        color: #64748b;
        
        &:hover {
          color: #1a202c;
          background: rgba(0, 0, 0, 0.04);
        }
      }
      
      .header-content {
        flex: 1;
        
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
        margin-top: 8px;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .main-info-card {
      border-radius: 12px !important;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        
        .title-section {
          flex: 1;
          
          h2 {
            margin: 0 0 12px 0;
            font-size: 24px;
            font-weight: 600;
            color: #1a202c;
          }
          
          .category-chip {
            background: #fef2f2 !important;
            color: #dc2626 !important;
            border: 1px solid #fecaca !important;
            
            mat-icon {
              font-size: 16px;
              margin-right: 4px;
            }
          }
        }
        
        .value-section {
          text-align: right;
          
          .value-label {
            display: block;
            font-size: 14px;
            color: #64748b;
            margin-bottom: 4px;
          }
          
          .value-amount {
            font-size: 28px;
            font-weight: 700;
            color: #dc2626;
          }
        }
      }
      
      .card-content {
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
          
          .info-section {
            h3 {
              display: flex;
              align-items: center;
              gap: 8px;
              margin: 0 0 16px 0;
              font-size: 16px;
              font-weight: 600;
              color: #1a202c;
              
              mat-icon {
                color: #ef4444;
                font-size: 20px;
              }
            }
            
            .info-list {
              .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
                
                &:last-child {
                  border-bottom: none;
                }
                
                .label {
                  font-weight: 500;
                  color: #64748b;
                  font-size: 14px;
                }
                
                .value {
                  font-weight: 600;
                  color: #1a202c;
                  font-size: 14px;
                  text-align: right;
                }
                
                .status-active {
                  background: #f0fdf4 !important;
                  color: #166534 !important;
                  border: 1px solid #bbf7d0 !important;
                  
                  mat-icon {
                    color: #16a34a;
                  }
                }
                
                .status-inactive {
                  background: #fef2f2 !important;
                  color: #dc2626 !important;
                  border: 1px solid #fecaca !important;
                  
                  mat-icon {
                    color: #ef4444;
                  }
                }
              }
            }
          }
        }
      }
    }

    .actions-card {
      border-radius: 12px !important;
      
      .actions-header {
        margin-bottom: 16px;
        
        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
        }
      }
      
      .actions-content {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        
        button {
          mat-icon {
            margin-right: 8px;
          }
          
          &[color="primary"] {
            background: linear-gradient(135deg, #ef4444, #dc2626) !important;
            color: white !important;
          }
        }
      }
    }

    .history-card {
      border-radius: 12px !important;
      
      .card-header {
        margin-bottom: 16px;
        
        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1a202c;
          
          mat-icon {
            color: #ef4444;
          }
        }
      }
      
      .history-content {
        .history-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
          
          .history-icon {
            width: 32px;
            height: 32px;
            background: #f0fdf4;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            
            mat-icon {
              color: #16a34a;
              font-size: 18px;
            }
          }
          
          .history-details {
            .history-title {
              font-weight: 500;
              color: #1a202c;
              font-size: 14px;
            }
            
            .history-time {
              font-size: 12px;
              color: #64748b;
              margin-top: 2px;
            }
          }
        }
        
        .history-placeholder {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 0;
          color: #94a3b8;
          font-size: 14px;
          
          mat-icon {
            font-size: 18px;
          }
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      
      mat-spinner {
        margin-bottom: 16px;
      }
      
      p {
        color: #64748b;
        font-weight: 500;
        margin: 0;
      }
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
      
      mat-icon {
        font-size: 64px;
        color: #f87171;
        margin-bottom: 16px;
      }
      
      h3 {
        margin: 0 0 8px 0;
        color: #1a202c;
        font-size: 20px;
      }
      
      p {
        margin: 0 0 24px 0;
        color: #64748b;
        max-width: 400px;
      }
      
      button {
        background: linear-gradient(135deg, #ef4444, #dc2626) !important;
        color: white !important;
        
        mat-icon {
          margin-right: 8px;
        }
      }
    }

    // Responsive
    @media (max-width: 768px) {
      .expense-detail-container {
        padding: 16px;
      }
      
      .header {
        .header-content h1 {
          font-size: 24px;
        }
      }
      
      .main-info-card .card-header {
        flex-direction: column;
        gap: 16px;
        
        .value-section {
          text-align: left;
        }
      }
      
      .info-grid {
        grid-template-columns: 1fr !important;
      }
      
      .actions-content {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class ExpenseDetailComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  expense: ExpenseResponse | null = null;
  isLoading = false;
  expenseId: number | null = null;

  constructor(
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.expenseId = +this.route.snapshot.paramMap.get('id')!;
    this.loadExpense();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadExpense(): void {
    if (!this.expenseId) {
      this.router.navigate(['/dashboard/expenses']);
      return;
    }

    this.isLoading = true;
    
    this.expenseService.getExpenseById(this.expenseId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.notificationService.error('Erro ao carregar despesa');
          return of(null);
        })
      )
      .subscribe(expense => {
        this.isLoading = false;
        this.expense = expense;
      });
  }

  editExpense(): void {
    if (this.expense) {
      this.router.navigate(['/dashboard/expenses', this.expense.id, 'edit']);
    }
  }

  deleteExpense(): void {
    if (!this.expense) return;

    const confirmMessage = `Tem certeza que deseja excluir a despesa "${this.expense.description}"?\n\nEsta ação não pode ser desfeita.`;
    
    if (confirm(confirmMessage)) {
      this.expenseService.deleteExpense(this.expense.id)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.notificationService.error('Erro ao excluir despesa');
            return of('');
          })
        )
        .subscribe(result => {
          if (result) {
            this.notificationService.success('Despesa excluída com sucesso');
            this.router.navigate(['/dashboard/expenses']);
          }
        });
    }
  }

  duplicateExpense(): void {
    if (this.expense) {
      this.router.navigate(['/dashboard/expenses/new'], {
        queryParams: {
          duplicate: this.expense.id
        }
      });
    }
  }

  refreshExpense(): void {
    this.loadExpense();
    this.notificationService.info('Dados atualizados');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/expenses']);
  }

  formatCurrency(value: number): string {
    return this.expenseService.formatCurrency(value);
  }

  formatDate(date: string): string {
    return this.expenseService.formatDate(date);
  }

  formatDateTime(dateTime: string): string {
    return this.expenseService.formatDateTime(dateTime);
  }
}
