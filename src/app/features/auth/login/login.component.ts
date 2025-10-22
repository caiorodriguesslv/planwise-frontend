import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FormsModule
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
    const form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    form.markAsUntouched();
    return form;
  }

  /**
   * Cria o formulário de registro
   */
  private createRegisterForm(): FormGroup {
    const form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    form.markAsUntouched();
    return form;
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
    this.currentForm.markAsUntouched();
    this.currentForm.markAsPristine();
  }

  /**
   * Alterna para modo de registro
   */
  setRegisterMode(): void {
    this.isLoginMode = false;
    this.currentForm = this.registerForm;
    this.currentForm.markAsUntouched();
    this.currentForm.markAsPristine();
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
        const { confirmPassword, ...registrationData } = formData;
        this.authService.register(registrationData).subscribe({
          next: () => {
            // Após registro bem-sucedido, alterna para login
            this.setLoginMode();
            this.loginForm.patchValue({ email: formData.email });
          },
          error: (error) => {
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
    Object.keys(this.currentForm.controls).forEach(key => {
      const control = this.currentForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
}