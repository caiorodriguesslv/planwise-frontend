import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

export type CardVariant = 'default' | 'glass' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card [class]="getCardClasses()">
      <mat-card-header *ngIf="title || subtitle">
        <mat-card-title *ngIf="title">{{ title }}</mat-card-title>
        <mat-card-subtitle *ngIf="subtitle">{{ subtitle }}</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content [class]="getContentClasses()">
        <ng-content></ng-content>
      </mat-card-content>
      
      <mat-card-actions *ngIf="hasActions" [class]="getActionsClasses()">
        <ng-content select="[slot=actions]"></ng-content>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() variant: CardVariant = 'default';
  @Input() padding: CardPadding = 'medium';
  @Input() hasActions: boolean = false;
  @Input() loading: boolean = false;

  getCardClasses(): string {
    const classes = [
      'app-card',
      `app-card--${this.variant}`,
      this.loading ? 'app-card--loading' : ''
    ].filter(Boolean);
    
    return classes.join(' ');
  }

  getContentClasses(): string {
    const classes = [
      'app-card__content',
      `app-card__content--${this.padding}`
    ].filter(Boolean);
    
    return classes.join(' ');
  }

  getActionsClasses(): string {
    return 'app-card__actions';
  }
}
