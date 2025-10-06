import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <button 
      mat-raised-button
      [class]="getButtonClasses()"
      [disabled]="disabled"
      [type]="type"
      (click)="onClick.emit($event)">
      
      <mat-icon *ngIf="icon && !loading" [class]="iconClass">{{ icon }}</mat-icon>
      
      <mat-spinner *ngIf="loading" diameter="16" class="button-spinner"></mat-spinner>
      
      <span *ngIf="!loading" [class]="textClass">{{ label }}</span>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() icon?: string;
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth: boolean = false;
  
  @Output() onClick = new EventEmitter<Event>();

  getButtonClasses(): string {
    const classes = [
      'app-button',
      `app-button--${this.variant}`,
      `app-button--${this.size}`,
      this.fullWidth ? 'app-button--full-width' : '',
      this.loading ? 'app-button--loading' : ''
    ].filter(Boolean);
    
    return classes.join(' ');
  }

  get iconClass(): string {
    return this.size === 'small' ? 'button-icon--small' : 'button-icon--medium';
  }

  get textClass(): string {
    return this.size === 'small' ? 'button-text--small' : 'button-text--medium';
  }
}
