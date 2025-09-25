import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Design imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <mat-card>
          <mat-card-header>
            <div class="header-content">
              <div class="logo">
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
              <mat-card-title>Entrar na sua conta</mat-card-title>
              <mat-card-subtitle>Gerencie suas finanças de forma inteligente</mat-card-subtitle>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              
              <!-- Email Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input 
                  matInput 
                  type="email" 
                  formControlName="email" 
                  placeholder="seu@email.com"
                  autocomplete="email">
                <mat-icon matSuffix>mail_outline</mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  Email é obrigatório
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  Email inválido
                </mat-error>
              </mat-form-field>

              <!-- Password Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Senha</mat-label>
                <input 
                  matInput 
                  [type]="hidePassword ? 'password' : 'text'" 
                  formControlName="password"
                  placeholder="Sua senha"
                  autocomplete="current-password">
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Senha é obrigatória
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  Senha deve ter no mínimo 6 caracteres
                </mat-error>
              </mat-form-field>

              <!-- Submit Button -->
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                class="login-button full-width"
                [disabled]="loginForm.invalid || loadingService.isCurrentlyLoading">
                
                <span *ngIf="!loadingService.isCurrentlyLoading">
                  <mat-icon>account_circle</mat-icon>
                  Entrar
                </span>
                
                <span *ngIf="loadingService.isCurrentlyLoading" class="loading-content">
                  <mat-spinner diameter="20"></mat-spinner>
                  Entrando...
                </span>
              </button>

            </form>
          </mat-card-content>

          <mat-divider></mat-divider>

          <mat-card-actions class="card-actions">
            <p class="register-text">
              Não tem uma conta? 
              <a routerLink="/auth/register" class="register-link">
                Criar conta gratuita
              </a>
            </p>
          </mat-card-actions>

        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
      
      // Background com imagem e fallback vibrante
      background-color: #ff6b6b;
      background-image: url('/login-background.jpg');
      
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: fixed;
      
      
      // Efeito de animação suave no background
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          45deg,
          rgba(63, 81, 181, 0.1) 0%,
          transparent 50%,
          rgba(156, 39, 176, 0.1) 100%
        );
        animation: backgroundShift 20s ease-in-out infinite;
      }
    }

    @keyframes backgroundShift {
      0%, 100% { 
        background-position: 0% 50%; 
      }
      50% { 
        background-position: 100% 50%; 
      }
    }

    @keyframes gradientShift {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 2;
      
      mat-card {
        border-radius: 24px !important;
        box-shadow: 
          0 25px 50px rgba(0, 0, 0, 0.4),
          0 15px 30px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.95) !important;
        border: 2px solid rgba(255, 255, 255, 0.3);
        overflow: hidden;
        
        // Animação de entrada mais dinâmica
        animation: cardSlideIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #ff6b6b, #ee5a24, #fd79a8, #e84393);
          border-radius: 24px 24px 0 0;
          background-size: 200% 100%;
          animation: gradientShift 3s ease-in-out infinite;
        }
      }
    }

    @keyframes cardSlideIn {
      0% {
        opacity: 0;
        transform: translateY(50px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .header-content {
      text-align: center;
      width: 100%;
      padding: 32px 24px 24px;
      
      .logo {
        margin-bottom: 20px;
        
        svg {
          height: 55px;
          width: auto;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
      }
      
      mat-card-title {
        font-size: 28px !important;
        font-weight: 700 !important;
        color: #2c3e50 !important;
        margin-bottom: 8px !important;
        background: linear-gradient(135deg, #3f51b5, #9c27b0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      mat-card-subtitle {
        font-size: 16px !important;
        color: #64748b !important;
        font-weight: 400 !important;
        line-height: 1.5;
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 0 24px;
      margin-top: 8px;
      
      mat-form-field {
        .mat-mdc-form-field-outline {
          border-radius: 16px !important;
          border-width: 2px !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
        }
        
        &.mat-focused {
          .mat-mdc-form-field-outline-thick {
            border-color: #ff6b6b !important;
            border-width: 3px !important;
          }
          
          .mat-mdc-form-field-label {
            color: #ff6b6b !important;
          }
        }
        
        .mat-mdc-form-field-icon-suffix {
          color: #ff6b6b !important;
          font-size: 22px;
          
          mat-icon {
            font-family: 'Material Icons' !important;
            font-weight: normal;
            font-style: normal;
            font-size: 22px !important;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
          }
        }
        
        .mat-mdc-form-field-label {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 600 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
        }
        
        input {
          font-size: 16px;
          padding: 18px 16px;
          color: #ffffff !important;
          font-weight: 600 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
          
          &::placeholder {
            color: rgba(255, 255, 255, 0.6) !important;
            font-weight: 400;
          }
          
          &:focus {
            outline: none;
          }
        }
        
        // Hover effect
        &:hover .mat-mdc-form-field-outline {
          border-color: rgba(255, 255, 255, 0.8) !important;
        }
        
        // Error states
        &.mat-form-field-invalid {
          .mat-mdc-form-field-outline-thick {
            border-color: #e53e3e !important;
          }
          
          .mat-mdc-form-field-label {
            color: #e53e3e !important;
          }
        }
        
        mat-error {
          color: #e53e3e !important;
          font-weight: 500;
          font-size: 13px;
          margin-top: 4px;
        }
      }
    }

    .full-width {
      width: 100%;
    }

    .login-button {
      height: 56px !important;
      font-size: 18px !important;
      font-weight: 700 !important;
      margin-top: 32px !important;
      border-radius: 16px !important;
      color: #ffffff !important;
      border: none !important;
      text-transform: none !important;
      letter-spacing: 0.5px !important;
      
      // Gradiente vibrante e colorido
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 25%, #fd79a8 75%, #e84393 100%) !important;
      box-shadow: 
        0 8px 32px rgba(238, 90, 36, 0.3),
        0 4px 16px rgba(255, 107, 107, 0.2) !important;
      
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      
      // Efeito shimmer animado
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg, 
          transparent, 
          rgba(255, 255, 255, 0.4), 
          transparent
        );
        transition: left 0.6s ease;
      }
      
      &:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 
          0 12px 40px rgba(238, 90, 36, 0.4),
          0 8px 24px rgba(255, 107, 107, 0.3) !important;
        background: linear-gradient(135deg, #ff7675 0%, #fd79a8 25%, #e84393 75%, #a29bfe 100%) !important;
        
        &::before {
          left: 100%;
        }
      }
      
      &:active {
        transform: translateY(-1px) scale(0.98);
      }
      
      &:disabled {
        background: linear-gradient(135deg, #b2bec3, #ddd) !important;
        transform: none !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      // Conteúdo do botão
      .loading-content {
        display: flex;
        align-items: center;
        gap: 12px;
        justify-content: center;
      }
      
      mat-icon {
        margin-right: 8px;
        font-size: 20px !important;
        color: #ffffff !important;
        font-family: 'Material Icons' !important;
        font-weight: normal;
        font-style: normal;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      
      span {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
    }

    mat-divider {
      margin: 24px 0 !important;
      opacity: 0.1;
    }

    .card-actions {
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 0 24px 32px;
      
      .register-text {
        text-align: center;
        margin: 0;
        color: #64748b;
        font-size: 16px;
        font-weight: 500;
        
        .register-link {
          color: #ff6b6b;
          text-decoration: none;
          font-weight: 700;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            transition: width 0.3s ease;
          }
          
          &:hover {
            background: linear-gradient(135deg, #fd79a8, #e84393);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            
            &::after {
              width: 100%;
            }
          }
        }
      }
    }

    // Responsive Design
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
        background-attachment: scroll;
        // Garante que a imagem funcione bem no mobile
        background-size: cover;
        
        // Imagem de background para mobile
        background-image: url('/login-background.jpg');
      }
      
      .login-card {
        max-width: 100%;
        
        mat-card {
          border-radius: 16px !important;
        }
      }
      
      .header-content {
        padding: 24px 20px 20px;
        
        mat-card-title {
          font-size: 24px !important;
        }
        
        mat-card-subtitle {
          font-size: 14px !important;
        }
      }
      
      .login-form {
        padding: 0 20px;
        gap: 16px;
        
        mat-form-field input {
          font-size: 16px; // Evita zoom no iOS
        }
      }
      
      .card-actions {
        padding: 0 20px 24px;
      }
    }

    @media (max-width: 360px) {
      .header-content .logo svg {
        height: 45px;
      }
      
      .header-content mat-card-title {
        font-size: 22px !important;
      }
    }

    // Melhorias de acessibilidade
    @media (prefers-reduced-motion: reduce) {
      .login-card mat-card {
        animation: none;
      }
      
      .login-container::before {
        animation: none;
      }
      
      .login-button {
        transition: none !important;
        
        &::before {
          transition: none;
        }
        
        &:hover {
          transform: none;
        }
      }
    }

    // Tema escuro
    @media (prefers-color-scheme: dark) {
      .login-card mat-card {
        background: rgba(30, 30, 30, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .header-content mat-card-subtitle {
        color: #94a3b8 !important;
      }
      
      .card-actions .register-text {
        color: #94a3b8;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  
  loginForm: FormGroup;
  hidePassword = true;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit(): void {
    // Captura URL de retorno se existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  /**
   * Cria o formulário de login
   */
  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Submete o formulário de login
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: () => {
          console.log('✅ Login component: Login realizado com sucesso');
          // AuthService já faz o redirecionamento automático para dashboard
          // Só redirecionamos aqui se for para uma URL específica diferente
          if (this.returnUrl && this.returnUrl !== '/dashboard') {
            console.log('🔄 Login component: Redirecionando para URL específica:', this.returnUrl);
            setTimeout(() => {
              this.router.navigateByUrl(this.returnUrl);
            }, 200); // Aguarda um pouco mais para garantir que AuthService terminou
          } else {
            console.log('🔄 Login component: Deixando AuthService fazer o redirecionamento padrão');
          }
        },
        error: (error) => {
          console.error('❌ Login component: Erro no login:', error);
          // Erro já é tratado pelo AuthService e interceptors
          // Limpa apenas a senha por segurança
          this.loginForm.patchValue({ password: '' });
        }
      });
    } else {
      // Marca todos os campos como touched para mostrar erros
      this.markFormGroupTouched();
    }
  }

  /**
   * Marca todos os campos do formulário como touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
