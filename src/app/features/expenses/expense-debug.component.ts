import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseService } from '../../core/services/expense.service';
import { HttpService } from '../../core/services/http.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-expense-debug',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div style="padding: 20px;">
      <mat-card>
        <h2>🔧 Debug da API de Despesas</h2>
        
        <div style="margin: 20px 0;">
          <h3>Configuração:</h3>
          <p><strong>API URL:</strong> {{ apiUrl }}</p>
          <p><strong>Token presente:</strong> {{ hasToken ? 'Sim' : 'Não' }}</p>
          <p><strong>User autenticado:</strong> {{ isAuthenticated ? 'Sim' : 'Não' }}</p>
        </div>

        <div style="margin: 20px 0;">
          <button mat-raised-button color="primary" (click)="testApiConnection()">
            Testar Conexão API
          </button>
          <button mat-raised-button (click)="testExpenseEndpoint()" style="margin-left: 10px;">
            Testar Endpoint Despesas
          </button>
          <button mat-raised-button (click)="testCategoryEndpoint()" style="margin-left: 10px;">
            Testar Endpoint Categorias
          </button>
        </div>

        <div *ngIf="debugResult" style="margin: 20px 0;">
          <h3>Resultado:</h3>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; max-height: 400px; overflow: auto;">{{ debugResult | json }}</pre>
        </div>

        <div *ngIf="errorMessage" style="margin: 20px 0; color: red;">
          <h3>❌ Erro:</h3>
          <p>{{ errorMessage }}</p>
        </div>
      </mat-card>
    </div>
  `
})
export class ExpenseDebugComponent implements OnInit {
  apiUrl = environment.apiUrl;
  hasToken = false;
  isAuthenticated = false;
  debugResult: any = null;
  errorMessage: string = '';

  constructor(
    private expenseService: ExpenseService,
    private httpService: HttpService
  ) {}

  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.hasToken = !!localStorage.getItem(environment.tokenKey);
    // Você pode adicionar mais verificações de autenticação aqui
  }

  testApiConnection() {
    this.debugResult = null;
    this.errorMessage = '';
    
    console.log('🔍 Testando conexão com:', this.apiUrl);
    
    // Teste simples de conectividade
    this.httpService.get('health').subscribe({
      next: (result) => {
        this.debugResult = {
          status: 'success',
          message: 'Conexão com API OK',
          data: result
        };
        console.log('✅ API conectada:', result);
      },
      error: (error) => {
        this.errorMessage = `Erro de conexão: ${error.message || error}`;
        console.error('❌ Erro de conexão:', error);
        
        // Teste alternativo direto
        fetch(this.apiUrl + '/health')
          .then(response => {
            console.log('🌐 Teste direto fetch:', response.status);
            this.debugResult = {
              status: 'fetch_test',
              message: `Resposta direta: ${response.status}`,
              url: this.apiUrl + '/health'
            };
          })
          .catch(fetchError => {
            console.error('❌ Fetch também falhou:', fetchError);
            this.errorMessage += ` | Fetch: ${fetchError.message}`;
          });
      }
    });
  }

  testExpenseEndpoint() {
    this.debugResult = null;
    this.errorMessage = '';
    
    console.log('🔍 Testando endpoint de despesas...');
    
    this.expenseService.getAllExpensesList().subscribe({
      next: (expenses) => {
        this.debugResult = {
          status: 'success',
          message: `Despesas carregadas: ${expenses.length}`,
          data: expenses
        };
        console.log('✅ Despesas carregadas:', expenses);
      },
      error: (error) => {
        this.errorMessage = `Erro ao carregar despesas: ${error.status} - ${error.message}`;
        console.error('❌ Erro despesas:', error);
        
        this.debugResult = {
          status: 'error',
          error: error,
          url: this.apiUrl + '/expenses/all'
        };
      }
    });
  }

  testCategoryEndpoint() {
    this.debugResult = null;
    this.errorMessage = '';
    
    console.log('🔍 Testando endpoint de categorias...');
    
    this.expenseService.getExpenseCategories().subscribe({
      next: (categories) => {
        this.debugResult = {
          status: 'success',
          message: `Categorias carregadas: ${categories.length}`,
          data: categories
        };
        console.log('✅ Categorias carregadas:', categories);
      },
      error: (error) => {
        this.errorMessage = `Erro ao carregar categorias: ${error.status} - ${error.message}`;
        console.error('❌ Erro categorias:', error);
        
        this.debugResult = {
          status: 'error',
          error: error,
          url: this.apiUrl + '/categories/type/DESPESA'
        };
      }
    });
  }
}
