import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services e Models
import { IncomeService } from '../../../core/services/income.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IncomeResponse, IncomeFilters, IncomeStats } from '../../../core/models/income.model';
import { PageRequest } from '../../../core/models/api.model';

@Component({
  selector: 'app-income-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './income-list.component.html',
  styleUrls: ['./income-list.component.scss']
})
export class IncomeListComponent implements OnInit, OnDestroy {
  // Dados
  incomes: IncomeResponse[] = [];
  stats: IncomeStats = { total: 0, average: 0, count: 0 };

  // Paginação
  totalElements = 0;
  totalPages = 0;
  pageRequest: PageRequest = { page: 0, size: 10 };
  
  // Filtros
  filterForm: FormGroup;
  
  // Estados
  isLoading = false;

  // Colunas da tabela
  displayedColumns: string[] = ['description', 'value', 'date', 'category', 'actions'];

  // Controle de ciclo de vida
  private destroy$ = new Subject<void>();

  constructor(
    private incomeService: IncomeService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadIncomes();
    this.loadStats();
    this.setupFilterSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterSubscriptions(): void {
    // Observar mudanças nos filtros
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageRequest.page = 0; // Reset para primeira página
        this.loadIncomes();
      });
  }

  private loadIncomes(): void {
    this.isLoading = true;
    
    const filters: IncomeFilters = {
      search: this.filterForm.get('search')?.value || undefined,
      startDate: this.filterForm.get('startDate')?.value || undefined,
      endDate: this.filterForm.get('endDate')?.value || undefined
    };

    this.incomeService.getAllIncomes(this.pageRequest, filters)
      .pipe(
        catchError((error: any) => {
          console.error('Erro ao carregar receitas:', error);
          this.notificationService.error('Erro ao carregar receitas');
          return of({ content: [], totalElements: 0, totalPages: 0 });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response: any) => {
        this.incomes = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  private loadStats(): void {
    this.incomeService.getIncomeStats()
      .pipe(
        catchError((error: any) => {
          console.error('Erro ao carregar estatísticas:', error);
          return of({ total: 0, average: 0, count: 0 });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(stats => {
        this.stats = stats;
        this.cdr.markForCheck();
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageRequest.page = event.pageIndex;
    this.pageRequest.size = event.pageSize;
    this.loadIncomes();
  }

  createNew(): void {
    this.router.navigate(['/dashboard/incomes/new']);
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  viewIncome(income: IncomeResponse): void {
    this.router.navigate(['/dashboard/incomes', income.id]);
  }

  editIncome(income: IncomeResponse): void {
    this.router.navigate(['/dashboard/incomes', income.id, 'edit']);
  }

  deleteIncome(income: IncomeResponse): void {
    if (confirm(`Tem certeza que deseja excluir a receita "${income.description}"?`)) {
      this.incomeService.deleteIncome(income.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Receita excluída com sucesso!');
            this.loadIncomes(); // Recarregar a lista
            this.loadStats(); // Recarregar estatísticas
          },
          error: (error) => {
            console.error('Erro ao excluir receita:', error);
            this.notificationService.error('Erro ao excluir receita');
          }
        });
    }
  }

  getActiveFiltersCount(): number {
    const formValue = this.filterForm.getRawValue();
    let count = 0;
    
    if (formValue.search?.trim()) count++;
    if (formValue.startDate) count++;
    if (formValue.endDate) count++;
    
    return count;
  }
}


