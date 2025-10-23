import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavigationItem, NavigationSection } from '../types';

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
          <span class="logo-text">PlanWise</span>
        </div>
        <button mat-icon-button class="collapse-btn" (click)="toggleCollapse()">
          <mat-icon>{{ isCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-section" *ngFor="let section of navigationSections">
          <div class="section-header">
            <h3 class="section-title">{{ section.title }}</h3>
            <div class="section-line"></div>
          </div>
          
          <div class="nav-item" 
               *ngFor="let item of section.items"
               [class.active]="isRouteActive(item.route)"
               [class.disabled]="item.disabled"
               (click)="onItemClick(item, $event)"
               [title]="item.label">
            <div class="nav-icon">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <span class="nav-text">{{ item.label }}</span>
            <span class="badge" *ngIf="item.badge">{{ item.badge }}</span>
            <div class="active-indicator"></div>
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
  
  @Output() itemClick = new EventEmitter<NavigationItem>();

  // Signals para estado reativo
  private _isMobileOpen = signal(false);
  private _isCollapsed = signal(false);

  isRouteActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  onItemClick(item: NavigationItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!item.disabled) {
      this.itemClick.emit(item);
    }
  }

  toggleCollapse(): void {
    this._isCollapsed.set(!this._isCollapsed());
  }

  toggleMobileOpen(): void {
    this._isMobileOpen.set(!this._isMobileOpen());
  }

  // Getters para signals
  get isMobileOpen(): boolean {
    return this._isMobileOpen();
  }

  get isCollapsed(): boolean {
    return this._isCollapsed();
  }
}
