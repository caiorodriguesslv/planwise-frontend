import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/components/layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - PlanWise'
      },
      {
        path: 'expenses',
        loadChildren: () => import('../expenses/expenses.routes').then(m => m.expenseRoutes)
      },
      {
        path: 'categories',
        loadChildren: () => import('../categories/categories.routes').then(m => m.categoryRoutes)
      }
    ]
  }
];
