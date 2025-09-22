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
                <mat-icon matSuffix>email</mat-icon>
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
                  <mat-icon>login</mat-icon>
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
            
            <button 
              mat-button 
              color="accent" 
              routerLink="/home"
              class="back-button">
              <mat-icon>arrow_back</mat-icon>
              Voltar ao início
            </button>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
    }

    .header-content {
      text-align: center;
      width: 100%;
      
      .logo {
        margin-bottom: 16px;
        
        svg {
          height: 50px;
          width: auto;
        }
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }

    .full-width {
      width: 100%;
    }

    .login-button {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 16px;
      
      .loading-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .card-actions {
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
    }

    .register-text {
      text-align: center;
      margin: 0;
      color: #666;
      
      .register-link {
        color: #3f51b5;
        text-decoration: none;
        font-weight: 500;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .back-button {
      color: #666;
    }

    // Responsive
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }
      
      .login-card {
        max-width: 100%;
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
          // Sucesso - AuthService já faz o redirecionamento
          // Mas vamos garantir que vai para a URL correta
          if (this.returnUrl && this.returnUrl !== '/dashboard') {
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        error: () => {
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
