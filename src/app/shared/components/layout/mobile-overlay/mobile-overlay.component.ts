import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="mobile-overlay" 
      [class.active]="isActive"
      (click)="onOverlayClick.emit()">
    </div>
  `,
  styleUrls: ['./mobile-overlay.component.scss']
})
export class MobileOverlayComponent {
  @Input() isActive: boolean = false;
  
  @Output() onOverlayClick = new EventEmitter<void>();
}
