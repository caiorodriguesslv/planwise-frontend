import { Routes } from '@angular/router';
import { IncomeListComponent } from './list/income-list.component';
import { IncomeFormComponent } from './form/income-form.component';
import { IncomeDetailComponent } from './detail/income-detail.component';

export const INCOMES_ROUTES: Routes = [
  {
    path: '',
    component: IncomeListComponent
  },
  {
    path: 'new',
    component: IncomeFormComponent
  },
  {
    path: ':id',
    component: IncomeDetailComponent
  },
  {
    path: ':id/edit',
    component: IncomeFormComponent
  }
];

