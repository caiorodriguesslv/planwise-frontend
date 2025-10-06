import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Services e Models
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryResponse, CategoryType, CategoryFilters, CategoryStats } from '../../../core/models/category.model';
import { PaginatedResponse, PageRequest } from '../../../core/models/api.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Data
  categories: CategoryResponse[] = [];
  stats: CategoryStats = {
    total: 0,
    byType: {
      receitas: 0,
      despesas: 0
    }
  };
  totalElements = 0;

  // Pagination
  pageRequest: PageRequest = {
    page: 0,
    size: 10,
    sort: 'name',
    direction: 'ASC'
  };

  // Form
  filterForm: FormGroup;

  // UI State
  isLoading = false;
  displayedColumns: string[] = ['name', 'type', 'createdAt', 'active', 'actions'];

  constructor(
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.setupFilterWatchers();
    this.loadCategories();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      type: ['']
    });
  }

  private setupFilterWatchers(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageRequest.page = 0;
        this.loadCategories();
      });
  }

  loadCategories(): void {
    this.isLoading = true;
    const filters = this.buildFilters();
    
    
    this.categoryService.getCategories(this.pageRequest, filters)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading categories:', error);
          this.notificationService.error('Erro ao carregar categorias');
          this.isLoading = false;
          return of({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: this.pageRequest.size,
            number: this.pageRequest.page,
            first: true,
            last: true,
            empty: true,
            pageable: {
              pageNumber: 0,
              pageSize: 10,
              sort: { sorted: false, unsorted: true }
            },
            numberOfElements: 0
          });
        })
      )
      .subscribe((response: PaginatedResponse<CategoryResponse>) => {
        this.categories = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.isLoading = false;
        
        // Forçar detecção de mudanças
        this.cdr.detectChanges();
      });
  }

  loadStats(): void {
    this.categoryService.getCategoryStats()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          return of({
            total: 0,
            byType: {
              receitas: 0,
              despesas: 0
            }
          });
        })
      )
      .subscribe(stats => {
        this.stats = stats;
        this.cdr.detectChanges();
      });
  }

  private buildFilters(): CategoryFilters {
    const formValue = this.filterForm.value;
    const filters: CategoryFilters = {};

    if (formValue.search?.trim()) {
      filters.search = formValue.search.trim();
    }

    if (formValue.type) {
      filters.type = formValue.type as CategoryType;
    }

    return filters;
  }

  getActiveFiltersCount(): number {
    const filters = this.buildFilters();
    let count = 0;
    
    if (filters.search) count++;
    if (filters.type) count++;
    
    return count;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.pageRequest.page = 0;
    this.loadCategories();
    this.notificationService.info('Filtros limpos');
  }

  onPageChange(event: PageEvent): void {
    this.pageRequest.page = event.pageIndex;
    this.pageRequest.size = event.pageSize;
    this.loadCategories();
  }

  getCategoryColor(type: CategoryType): string {
    return this.categoryService.generateCategoryColor(type);
  }

  getDeterministicColor(type: CategoryType, id: number): string {
    const colors = {
      [CategoryType.RECEITA]: [
        '#10b981', '#059669', '#16a34a', '#22c55e', '#15803d',
        '#84cc16', '#65a30d', '#a3e635', '#bef264', '#eab308'
      ],
      [CategoryType.DESPESA]: [
        '#ef4444', '#dc2626', '#b91c1c', '#f87171', '#fca5a5',
        '#fb923c', '#ea580c', '#c2410c', '#9a3412', '#f97316'
      ]
    };
    
    const typeColors = colors[type];
    // Usar o ID para gerar um índice determinístico
    const index = id % typeColors.length;
    return typeColors[index];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  createNew(): void {
    this.notificationService.info('Redirecionando para criar nova categoria...');
    // Navegar diretamente para o formulário de nova categoria
    this.router.navigate(['/dashboard/categories/new']);
  }

  editCategory(category: CategoryResponse): void {
    this.notificationService.info(`Editando categoria: ${category.name}`);
    // Implementar navegação para edição
  }

  duplicateCategory(category: CategoryResponse): void {
    this.notificationService.info(`Duplicando categoria: ${category.name}`);
    // Implementar duplicação
  }

  deleteCategory(category: CategoryResponse): void {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.notificationService.error('Erro ao deletar categoria');
            return of(null);
          })
        )
        .subscribe(result => {
          if (result !== null) {
            this.notificationService.success('Categoria excluída com sucesso');
            this.loadCategories();
            this.loadStats();
          }
        });
    }
  }
}