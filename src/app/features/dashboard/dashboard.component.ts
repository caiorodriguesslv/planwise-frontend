import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <mat-toolbar color="primary" class="dashboard-header">
        <span class="logo">PlanWise</span>
        <span class="spacer"></span>
        <span class="welcome-text">Olá, {{ authService.userName }}!</span>
        <button mat-icon-button (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Content -->
      <div class="dashboard-content">
        <div class="welcome-section">
          <h1>Bem-vindo ao PlanWise!</h1>
          <p>Sua central de controle financeiro</p>
        </div>

        <div class="cards-grid">
          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>account_balance</mat-icon>
              <mat-card-title>Receitas</mat-card-title>
              <mat-card-subtitle>Gerencie suas entradas</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Controle todas as suas fontes de receita de forma organizada.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" disabled>
                Em breve
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>trending_down</mat-icon>
              <mat-card-title>Despesas</mat-card-title>
              <mat-card-subtitle>Monitore seus gastos</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Acompanhe todas as suas despesas e categorize seus gastos.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" disabled>
                Em breve
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>flag</mat-icon>
              <mat-card-title>Metas</mat-card-title>
              <mat-card-subtitle>Alcance seus objetivos</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Defina e acompanhe suas metas financeiras com precisão.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" disabled>
                Em breve
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>bar_chart</mat-icon>
              <mat-card-title>Relatórios</mat-card-title>
              <mat-card-subtitle>Análise detalhada</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Visualize seus dados financeiros com gráficos e relatórios.</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" disabled>
                Em breve
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <div class="user-info">
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Informações da Conta</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Nome:</strong> {{ authService.userName }}</p>
              <p><strong>Email:</strong> {{ authService.userEmail }}</p>
              <p><strong>Role:</strong> {{ authService.isAdmin() ? 'Administrador' : 'Usuário' }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" disabled>
                Editar Perfil (Em breve)
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .dashboard-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      
      .logo {
        font-size: 20px;
        font-weight: 700;
      }
      
      .spacer {
        flex: 1 1 auto;
      }
      
      .welcome-text {
        margin-right: 16px;
        font-weight: 500;
      }
    }

    .dashboard-content {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 32px;
      
      h1 {
        color: #333;
        margin-bottom: 8px;
      }
      
      p {
        color: #666;
        font-size: 18px;
      }
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .feature-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      mat-icon[mat-card-avatar] {
        background-color: #3f51b5;
        color: white;
      }
    }

    .user-info {
      max-width: 400px;
      margin: 0 auto;
      
      mat-icon[mat-card-avatar] {
        background-color: #4caf50;
        color: white;
      }
    }

    // Responsive
    @media (max-width: 768px) {
      .dashboard-content {
        padding: 16px;
      }
      
      .cards-grid {
        grid-template-columns: 1fr;
      }
      
      .welcome-section h1 {
        font-size: 24px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {

  constructor(
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Implementação adicional se necessário
  }

  logout(): void {
    this.authService.logout();
  }
}
