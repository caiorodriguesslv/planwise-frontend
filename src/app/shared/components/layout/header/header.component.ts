import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserInfo } from '../types';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="top-header">
      <div class="header-left">
        <button 
          *ngIf="showMobileMenu"
          class="mobile-menu-btn" 
          mat-icon-button
          (click)="onMobileMenuClick.emit()"
          matTooltip="Abrir menu">
          <mat-icon>menu</mat-icon>
        </button>
        
        <div class="page-info">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
      </div>
      
      <div class="header-right">
        <div class="user-info">
          <div class="user-details" *ngIf="userInfo">
            <span class="name">{{ userInfo.name }}</span>
            <span class="role">{{ userInfo.role }}</span>
          </div>
          <div class="avatar" (click)="onUserClick.emit()">
            <mat-icon *ngIf="!userInfo?.avatar">person</mat-icon>
            <img *ngIf="userInfo?.avatar" [src]="userInfo?.avatar" [alt]="userInfo?.name ?? 'User'">
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() pageTitle: string = '';
  @Input() pageSubtitle: string = '';
  @Input() userInfo?: UserInfo;
  @Input() showMobileMenu: boolean = false;
  
  @Output() onMobileMenuClick = new EventEmitter<void>();
  @Output() onUserClick = new EventEmitter<void>();
}
