import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    <!-- Dashboard Content -->
    <div class="dashboard-content">
      
      <!-- Header -->
      <div class="page-header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="page-title">
          <div class="page-icon">
            <mat-icon>visibility</mat-icon>
          </div>
          <div class="title-content">
            <h1>Detalhes da Despesa</h1>
            <p>Informações completas sobre a despesa selecionada</p>
          </div>
        </div>
        <div class="header-actions" *ngIf="expense">
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
      <div class="content" *ngIf="!isLoading && expense && !hasError; else loadingTemplate">
        
        <!-- Main Information Card -->
        <mat-card class="main-info-card">
          <div class="card-header">
            <div class="title-section">
              <h2>{{ expense.description }}</h2>
              <mat-chip [class]="'category-chip ' + (expense.category.type === 'RECEITA' ? 'receita' : 'despesa')">
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
      <div class="error-state" *ngIf="hasError">
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
    // Estilos específicos do componente de detalhes de despesa - Baseado no Dashboard
    @use '../../../../styles/variables' as *;

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 30%, #16213e 70%, #0f0f23 100%);
      min-height: calc(100vh - 80px);
      position: relative;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 15% 15%, rgba(0, 212, 255, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(255, 167, 38, 0.08) 0%, transparent 70%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, transparent 50%);
        pointer-events: none;
        border-radius: 24px;
      }
      
      &::after {
        content: '';
        position: absolute;
        top: 1px;
        left: 1px;
        right: 1px;
        bottom: 1px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        border-radius: 23px;
        pointer-events: none;
      }
    }

    // Header - Design melhorado
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding: 40px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
        pointer-events: none;
      }
      
      .back-button {
        margin-right: 20px;
        color: rgba(255, 255, 255, 0.8) !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 12px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        backdrop-filter: blur(10px);
        
        &:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
      
      .page-title {
        display: flex;
        align-items: center;
        gap: 20px;
        flex: 1;
        
        .page-icon {
          width: 70px;
          height: 70px;
          font-size: 36px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #dc2626 100%);
          box-shadow: 
            0 12px 35px rgba(255, 107, 107, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 2;
          
          &::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
            border-radius: 23px;
            z-index: -1;
          }
          
          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
            border-radius: 20px;
            z-index: 1;
          }
          
          mat-icon {
            color: white;
            filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
            font-size: 36px;
            width: 36px;
            height: 36px;
            z-index: 3;
            position: relative;
          }
        }
        
        .title-content {
          h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          p {
            margin: 0;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.4;
          }
        }
      }
      
      .header-actions {
        .menu-btn {
          color: rgba(255, 255, 255, 0.7) !important;
          transition: all 0.3s ease !important;
          
          &:hover {
            color: white !important;
            background: rgba(255, 255, 255, 0.1) !important;
          }
          
          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }
        }
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .main-info-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.05) 100%) !important;
      border-radius: 24px !important;
      box-shadow: 
        0 16px 50px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(20px);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.35),
          0 0 0 1px rgba(255, 255, 255, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.25);
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
        pointer-events: none;
      }
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        pointer-events: none;
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        padding: 32px 32px 0 32px;
        
        .title-section {
          flex: 1;
          
          h2 {
            margin: 0 0 12px 0;
            font-size: 24px;
            font-weight: 600;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .category-chip {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 6px 12px !important;
            border-radius: 20px !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            color: white !important;
            border: none !important;
            
            &.receita {
              background: linear-gradient(135deg, #10b981, #059669) !important;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3) !important;
            }
            
            &.despesa {
              background: linear-gradient(135deg, #ef4444, #dc2626) !important;
              box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
            }
            
            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }
          }
        }
        
        .value-section {
          text-align: right;
          
          .value-label {
            display: block;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 4px;
          }
          
          .value-amount {
            font-size: 28px;
            font-weight: 700;
            color: white;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
        }
      }
      
      .card-content {
        padding: 0 32px 32px 32px;
        
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
              color: white;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              
              mat-icon {
                color: var(--planwise-cyan);
                font-size: 20px;
              }
            }
            
            .info-list {
              .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                
                &:last-child {
                  border-bottom: none;
                }
                
                .label {
                  font-weight: 500;
                  color: rgba(255, 255, 255, 0.7);
                  font-size: 14px;
                }
                
                .value {
                  font-weight: 600;
                  color: white;
                  font-size: 14px;
                  text-align: right;
                }
                
                .status-active {
                  background: linear-gradient(135deg, #10b981, #059669) !important;
                  color: white !important;
                  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3) !important;
                  border: none !important;
                  
                  mat-icon {
                    color: white;
                  }
                }
                
                .status-inactive {
                  background: linear-gradient(135deg, #6b7280, #4b5563) !important;
                  color: white !important;
                  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3) !important;
                  border: none !important;
                  
                  mat-icon {
                    color: white;
                  }
                }
              }
            }
          }
        }
      }
    }

    .actions-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 100%) !important;
      border-radius: 24px !important;
      box-shadow: 
        0 16px 50px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(20px);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.35),
          0 0 0 1px rgba(255, 255, 255, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.25);
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
        pointer-events: none;
      }
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        pointer-events: none;
      }
      
      .actions-header {
        margin-bottom: 16px;
        padding: 32px 32px 0 32px;
        
        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      }
      
      .actions-content {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        padding: 0 32px 32px 32px;
        
        button {
          border-radius: 12px !important;
          font-weight: 600 !important;
          text-transform: none !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          
          mat-icon {
            margin-right: 8px;
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
          
          &:hover {
            transform: translateY(-2px);
          }
          
          &[color="primary"] {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #dc2626 100%) !important;
            color: white !important;
            box-shadow: 
              0 8px 25px rgba(255, 107, 107, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            
            &:hover {
              box-shadow: 
                0 12px 35px rgba(255, 107, 107, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
            }
          }
          
          &[color="warn"] {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%) !important;
            color: white !important;
            box-shadow: 
              0 8px 25px rgba(239, 68, 68, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            
            &:hover {
              box-shadow: 
                0 12px 35px rgba(239, 68, 68, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
            }
          }
          
          &[disabled] {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
            color: rgba(255, 255, 255, 0.5) !important;
            box-shadow: none !important;
            cursor: not-allowed !important;
          }
        }
      }
    }

    .history-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 100%) !important;
      border-radius: 24px !important;
      box-shadow: 
        0 16px 50px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(20px);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.35),
          0 0 0 1px rgba(255, 255, 255, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.25);
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
        pointer-events: none;
      }
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        pointer-events: none;
      }
      
      .card-header {
        margin-bottom: 16px;
        padding: 32px 32px 0 32px;
        
        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          
          mat-icon {
            color: var(--planwise-orange);
          }
        }
      }
      
      .history-content {
        padding: 0 32px 32px 32px;
        
        .history-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          
          .history-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            
            mat-icon {
              color: white;
              font-size: 18px;
            }
          }
          
          .history-details {
            .history-title {
              font-weight: 500;
              color: white;
              font-size: 14px;
            }
            
            .history-time {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.6);
              margin-top: 2px;
            }
          }
        }
        
        .history-placeholder {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 0;
          color: rgba(255, 255, 255, 0.6);
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
        color: rgba(255, 255, 255, 0.7);
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
        color: white;
        font-size: 20px;
      }
      
      p {
        margin: 0 0 24px 0;
        color: rgba(255, 255, 255, 0.7);
        max-width: 400px;
      }
      
      button {
        background: linear-gradient(135deg, var(--planwise-red), var(--planwise-red-dark)) !important;
        color: white !important;
        
        mat-icon {
          margin-right: 8px;
        }
      }
    }

    // Responsive Design
    @media (max-width: 768px) {
      .dashboard-content {
        padding: 16px;
      }
      
      .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
        padding: 16px;
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
  hasError = false;

  constructor(
    private expenseService: ExpenseService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
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
    this.hasError = false;
    this.expense = null;
    this.cdr.detectChanges();
    
    this.expenseService.getExpenseById(this.expenseId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erro ao carregar despesa:', error);
          this.isLoading = false;
          this.hasError = true;
          this.notificationService.error('Erro ao carregar despesa');
          this.cdr.detectChanges();
          return of(null);
        })
      )
      .subscribe({
        next: (expense) => {
          this.isLoading = false;
          this.hasError = false;
          this.expense = expense;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro no subscribe:', error);
          this.isLoading = false;
          this.hasError = true;
          this.cdr.detectChanges();
        }
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
