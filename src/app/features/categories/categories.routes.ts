import { Routes } from '@angular/router';

export const categoryRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./list/category-list.component').then(c => c.CategoryListComponent),
    title: 'Lista de Categorias - PlanWise'
  },
  {
    path: 'new',
    loadComponent: () => import('./form/category-form.component').then(c => c.CategoryFormComponent),
    title: 'Nova Categoria - PlanWise'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./form/category-form.component').then(c => c.CategoryFormComponent),
    title: 'Editar Categoria - PlanWise'
  }
];
