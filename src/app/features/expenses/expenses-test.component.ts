import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-expenses-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card>
      <h2>Teste da API de Despesas</h2>
      <div>
        <button mat-raised-button color="primary" (click)="testGetCategories()">
          Testar Categorias de Despesa
        </button>
        <button mat-raised-button (click)="testGetExpenses()">
          Testar Lista de Despesas
        </button>
      </div>
      <div *ngIf="result">
        <h3>Resultado:</h3>
        <pre>{{ result | json }}</pre>
      </div>
    </mat-card>
  `,
  styles: [`
    mat-card {
      margin: 20px;
      padding: 20px;
    }
    button {
      margin: 10px;
    }
    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      max-height: 400px;
      overflow: auto;
    }
  `]
})
export class ExpensesTestComponent implements OnInit {
  result: any = null;

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {}

  testGetCategories() {
    this.expenseService.getExpenseCategories().subscribe({
      next: (categories) => {
        this.result = categories;
        console.log('Categorias de despesa:', categories);
      },
      error: (error) => {
        this.result = { error: error.message };
        console.error('Erro ao buscar categorias:', error);
      }
    });
  }

  testGetExpenses() {
    this.expenseService.getAllExpensesList().subscribe({
      next: (expenses) => {
        this.result = expenses;
        console.log('Lista de despesas:', expenses);
      },
      error: (error) => {
        this.result = { error: error.message };
        console.error('Erro ao buscar despesas:', error);
      }
    });
  }
}
