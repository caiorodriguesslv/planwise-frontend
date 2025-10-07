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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Modo atual (login ou register)
  isLoginMode = true;
  
  // Formulários
  loginForm: FormGroup;
  registerForm: FormGroup;
  currentForm: FormGroup;
  
  // Controles de visibilidade
  hidePassword = true;
  hideConfirmPassword = true;
  
  // URL de retorno
  returnUrl = '/dashboard';
  
  // Partículas para o gráfico
  particles = Array.from({ length: 20 }, (_, i) => ({ id: i }));

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.createLoginForm();
    this.registerForm = this.createRegisterForm();
    this.currentForm = this.loginForm;
  }

  ngOnInit(): void {
    // Captura URL de retorno se existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  /**
   * Cria o formulário de login
   */
  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Cria o formulário de registro
   */
  private createRegisterForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Validador para verificar se as senhas coincidem
   */
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Alterna para modo de login
   */
  setLoginMode(): void {
    this.isLoginMode = true;
    this.currentForm = this.loginForm;
  }

  /**
   * Alterna para modo de registro
   */
  setRegisterMode(): void {
    this.isLoginMode = false;
    this.currentForm = this.registerForm;
  }

  /**
   * Submete o formulário (login ou register)
   */
  onSubmit(): void {
    if (this.currentForm.valid) {
      const formData = this.currentForm.value;

      if (this.isLoginMode) {
        // Login
        this.authService.login(formData).subscribe({
          next: () => {
            if (this.returnUrl && this.returnUrl !== '/dashboard') {
              setTimeout(() => {
                this.router.navigateByUrl(this.returnUrl);
              }, 200);
            }
          },
          error: (error) => {
            this.currentForm.patchValue({ password: '' });
          }
        });
      } else {
        // Register
        this.authService.register(formData).subscribe({
          next: () => {
            // Após registro bem-sucedido, alterna para login
            this.setLoginMode();
            // Preenche o email no formulário de login
            this.loginForm.patchValue({ email: formData.email });
          },
          error: (error) => {
            // Erro já é tratado pelo AuthService
            this.currentForm.patchValue({ password: '', confirmPassword: '' });
          }
        });
      }
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