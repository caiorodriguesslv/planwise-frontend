import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  selector: 'app-register',
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
    <div class="register-container">
      <div class="register-card">
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
              <mat-card-title>Criar sua conta</mat-card-title>
              <mat-card-subtitle>Comece a gerenciar suas finanças hoje mesmo</mat-card-subtitle>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
              
              <!-- Name Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nome completo</mat-label>
                <input 
                  matInput 
                  type="text" 
                  formControlName="name" 
                  placeholder="Seu nome completo"
                  autocomplete="name">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="registerForm.get('name')?.hasError('required')">
                  Nome é obrigatório
                </mat-error>
                <mat-error *ngIf="registerForm.get('name')?.hasError('minlength')">
                  Nome deve ter no mínimo 3 caracteres
                </mat-error>
                <mat-error *ngIf="registerForm.get('name')?.hasError('maxlength')">
                  Nome deve ter no máximo 50 caracteres
                </mat-error>
              </mat-form-field>

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
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                  Email é obrigatório
                </mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
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
                  placeholder="Crie uma senha segura"
                  autocomplete="new-password">
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  Senha é obrigatória
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  Senha deve ter no mínimo 6 caracteres
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                  Senha deve ter ao menos: 1 letra maiúscula, 1 minúscula e 1 número
                </mat-error>
              </mat-form-field>

              <!-- Confirm Password Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmar senha</mat-label>
                <input 
                  matInput 
                  [type]="hideConfirmPassword ? 'password' : 'text'" 
                  formControlName="confirmPassword"
                  placeholder="Digite a senha novamente"
                  autocomplete="new-password">
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="hideConfirmPassword = !hideConfirmPassword"
                  [attr.aria-label]="'Hide confirm password'"
                  [attr.aria-pressed]="hideConfirmPassword">
                  <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                  Confirmação de senha é obrigatória
                </mat-error>
                <mat-error *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
                  As senhas não coincidem
                </mat-error>
              </mat-form-field>

              <!-- Submit Button -->
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                class="register-button full-width"
                [disabled]="registerForm.invalid || loadingService.isCurrentlyLoading">
                
                <span *ngIf="!loadingService.isCurrentlyLoading">
                  <mat-icon>person_add</mat-icon>
                  Criar conta
                </span>
                
                <span *ngIf="loadingService.isCurrentlyLoading" class="loading-content">
                  <mat-spinner diameter="20"></mat-spinner>
                  Criando conta...
                </span>
              </button>

            </form>
          </mat-card-content>

          <mat-divider></mat-divider>

          <mat-card-actions class="card-actions">
            <p class="login-text">
              Já tem uma conta? 
              <a routerLink="/auth/login" class="login-link">
                Entrar agora
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
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .register-card {
      width: 100%;
      max-width: 450px;
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

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }

    .full-width {
      width: 100%;
    }

    .register-button {
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

    .login-text {
      text-align: center;
      margin: 0;
      color: #666;
      
      .login-link {
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
      .register-container {
        padding: 16px;
      }
      
      .register-card {
        max-width: 100%;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public loadingService: LoadingService,
    private router: Router
  ) {
    this.registerForm = this.createForm();
  }

  ngOnInit(): void {
    // Implementação adicional se necessário
  }

  /**
   * Cria o formulário de registro
   */
  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  /**
   * Validador customizado para verificar se as senhas coincidem
   */
  private passwordMatchValidator(control: AbstractControl): {[key: string]: boolean} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }

    return null;
  }

  /**
   * Submete o formulário de registro
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      const userData = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      
      this.authService.register(userData).subscribe({
        next: () => {
          // Sucesso - AuthService já faz o redirecionamento
        },
        error: () => {
          // Erro já é tratado pelo AuthService e interceptors
          // Limpa as senhas por segurança
          this.registerForm.patchValue({ 
            password: '', 
            confirmPassword: '' 
          });
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
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
