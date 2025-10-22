import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  // Formulário de registro
  registerForm: FormGroup;
  
  // Partículas para o gráfico
  particles = Array.from({ length: 20 }, (_, i) => ({ id: i }));

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public loadingService: LoadingService,
    private router: Router
  ) {
    this.registerForm = this.createRegisterForm();
  }

  ngOnInit(): void {
    // Formulário já é criado no construtor
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
    
    // Marcar como untouched para não mostrar erros inicialmente
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
   * Submete o formulário de registro
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      const userData = this.registerForm.value;
      
      // Remove confirmPassword antes de enviar
      const { confirmPassword, ...registrationData } = userData;

      this.authService.register(registrationData).subscribe({
        next: () => {
          // AuthService já faz o redirecionamento automático para dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          // Erro já é tratado pelo AuthService e interceptors
          // Limpa apenas as senhas por segurança
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
      control?.markAsDirty();
    });
  }
}