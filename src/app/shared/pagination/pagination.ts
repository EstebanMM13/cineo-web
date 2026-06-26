import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
      <button
        (click)="changePage(currentPage - 1)"
        [disabled]="currentPage === 0"
        class="px-3 py-1.5 rounded text-sm disabled:opacity-30 transition-colors"
        style="background:#1a1a1a;color:#e5e5e5;border:1px solid #2a2a2a;"
      >&#8592;</button>

      <ng-container *ngFor="let p of pages">
        <button
          (click)="changePage(p)"
          [class.text-white]="p === currentPage"
          class="px-3 py-1.5 rounded text-sm transition-colors"
          [style]="p === currentPage ? 'background:#e50914;color:#fff;border:1px solid #e50914;' : 'background:#1a1a1a;color:#888;border:1px solid #2a2a2a;'"
        >{{ p + 1 }}</button>
      </ng-container>

      <button
        (click)="changePage(currentPage + 1)"
        [disabled]="currentPage === totalPages - 1"
        class="px-3 py-1.5 rounded text-sm disabled:opacity-30 transition-colors"
        style="background:#1a1a1a;color:#e5e5e5;border:1px solid #2a2a2a;"
      >&#8594;</button>
    </div>
  `,
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}
