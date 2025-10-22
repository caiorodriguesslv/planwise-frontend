import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

// Components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

// Routes
import { authRoutes } from './auth.routes';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(authRoutes),
    InputTextModule,
    PasswordModule,
    ButtonModule
  ],
  providers: []
})
export class AuthModule { }
