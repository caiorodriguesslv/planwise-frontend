import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <!-- Tela inicial do PlanWise -->
    <div class="app-container">
      <div class="welcome-screen">
        <div class="logo-section">
          <!-- Logo PlanWise -->
          <div class="planwise-logo">
            <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#3f51b5;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#9c27b0;stop-opacity:1" />
                </linearGradient>
              </defs>
              <text x="10" y="40" font-family="Roboto, sans-serif" font-size="32" font-weight="700" fill="url(#logoGradient)">
                PlanWise
              </text>
            </svg>
          </div>
          
          <h1>Sistema de Planejamento Financeiro</h1>
          <p class="subtitle">Gerencie suas finanças de forma inteligente e alcance seus objetivos financeiros.</p>
          
          <div class="features-grid">
            <div class="feature-card">
              <mat-icon>account_balance</mat-icon>
              <h3>Controle Financeiro</h3>
              <p>Organize receitas e despesas por categorias</p>
            </div>
            
            <div class="feature-card">
              <mat-icon>trending_up</mat-icon>
              <h3>Relatórios</h3>
              <p>Visualize seu progresso com gráficos detalhados</p>
            </div>
            
            <div class="feature-card">
              <mat-icon>flag</mat-icon>
              <h3>Metas Financeiras</h3>
              <p>Defina e acompanhe suas metas de economia</p>
            </div>
          </div>
          
          <div class="action-buttons">
            <button mat-raised-button color="primary" routerLink="/auth/login" class="main-button">
              Entrar na Plataforma
            </button>
            <button mat-stroked-button color="primary" routerLink="/auth/register" class="secondary-button">
              Criar Conta Gratuita
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .welcome-screen {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 48px;
      max-width: 800px;
      width: 100%;
      text-align: center;
    }

    .logo-section {
      .planwise-logo {
        margin-bottom: 24px;
        
        svg {
          height: 60px;
          width: auto;
        }
      }
      
      h1 {
        color: #333;
        font-size: 2.5rem;
        font-weight: 600;
        margin: 24px 0 16px 0;
        background: linear-gradient(45deg, #3f51b5, #9c27b0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .subtitle {
        color: #666;
        font-size: 1.2rem;
        margin-bottom: 48px;
        line-height: 1.6;
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
      margin: 48px 0;
      
      .feature-card {
        padding: 32px 24px;
        border-radius: 12px;
        background: #f8f9fa;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        mat-icon {
          font-size: 48px;
          height: 48px;
          width: 48px;
          color: #3f51b5;
          margin-bottom: 16px;
        }
        
        h3 {
          color: #333;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 16px 0 8px 0;
        }
        
        p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }
      }
    }

    .action-buttons {
      margin-top: 48px;
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      
      .main-button {
        padding: 12px 32px;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 8px;
        text-transform: none;
      }
      
      .secondary-button {
        padding: 12px 32px;
        font-size: 1.1rem;
        font-weight: 500;
        border-radius: 8px;
        text-transform: none;
      }
    }

    @media (max-width: 768px) {
      .welcome-screen {
        padding: 32px 24px;
      }
      
      .logo-section {
        h1 {
          font-size: 2rem;
        }
        
        .subtitle {
          font-size: 1.1rem;
        }
      }
      
      .features-grid {
        grid-template-columns: 1fr;
        gap: 20px;
        margin: 32px 0;
        
        .feature-card {
          padding: 24px 20px;
        }
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
        
        .main-button,
        .secondary-button {
          width: 100%;
          max-width: 280px;
        }
      }
    }
  `]
})
export class HomeComponent {
}
