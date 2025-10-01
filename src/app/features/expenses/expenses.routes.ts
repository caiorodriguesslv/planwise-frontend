import { Routes } from '@angular/router';

export const expenseRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./list/expense-list-v2.component').then(c => c.ExpenseListV2Component),
    title: 'Lista de Despesas - PlanWise'
  },
  {
    path: 'new',
    loadComponent: () => import('./form/expense-form.component').then(c => c.ExpenseFormComponent),
    title: 'Nova Despesa - PlanWise'
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/expense-detail.component').then(c => c.ExpenseDetailComponent),
    title: 'Detalhes da Despesa - PlanWise'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./form/expense-form.component').then(c => c.ExpenseFormComponent),
    title: 'Editar Despesa - PlanWise'
  }
];
