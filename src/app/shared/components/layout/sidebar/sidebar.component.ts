import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  disabled?: boolean;
  badge?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="sidebar" [class.mobile-open]="isMobileOpen" [class.collapsed]="isCollapsed">
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <span class="logo-text" *ngIf="!isCollapsed">PlanWise</span>
        </div>
        <button 
          *ngIf="!isCollapsed"
          mat-icon-button 
          class="collapse-btn"
          (click)="toggleCollapse()"
          matTooltip="Recolher menu">
          <mat-icon>chevron_left</mat-icon>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section" *ngFor="let section of navigationSections">
          <h3 class="section-title" *ngIf="!isCollapsed">{{ section.title }}</h3>
          
          <div class="nav-item" 
               *ngFor="let item of section.items"
               [class.active]="isRouteActive(item.route)"
               [class.disabled]="item.disabled"
               (click)="onItemClick(item, $event)">
            <div class="nav-icon">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <span class="nav-text" *ngIf="!isCollapsed">{{ item.label }}</span>
            <span class="badge" *ngIf="item.badge && !isCollapsed">{{ item.badge }}</span>
          </div>
        </div>
      </nav>
    </div>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() navigationSections: NavigationSection[] = [];
  @Input() currentRoute: string = '';
  @Input() isCollapsed: boolean = false;
  @Input() isMobileOpen: boolean = false;
  
  @Output() itemClick = new EventEmitter<NavigationItem>();
  @Output() toggleCollapseClick = new EventEmitter<void>();

  // Signals para estado reativo
  private _isCollapsed = signal(false);
  private _isMobileOpen = signal(false);

  isRouteActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  onItemClick(item: NavigationItem, event: Event): void {
    if (!item.disabled) {
      this.itemClick.emit(item);
    }
    event.preventDefault();
  }

  toggleCollapse(): void {
    this._isCollapsed.set(!this._isCollapsed());
    this.toggleCollapseClick.emit();
  }

  // Getters para signals
  get isCollapsed(): boolean {
    return this._isCollapsed();
  }

  get isMobileOpen(): boolean {
    return this._isMobileOpen();
  }
}
