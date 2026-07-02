import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenreService } from '../../core/services/genre.service';
import { Genre } from '../../core/models/models';

@Component({
  selector: 'app-admin-genres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-lg">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold text-white">Géneros</h2>
      </div>

      <div class="flex gap-2 mb-6">
        <input
          [(ngModel)]="newName"
          placeholder="Nuevo género..."
          class="flex-1 px-3 py-2 rounded text-sm text-white"
          style="background:#1a1a1a;border:1px solid #2a2a2a;"
          (keyup.enter)="create()"
        />
        <button (click)="create()" [disabled]="!newName.trim() || saving" class="px-4 py-2 rounded text-sm font-medium disabled:opacity-40" style="background:#D4A017;color:#080808;">
          Añadir
        </button>
      </div>

      <div class="flex flex-col gap-2">
        <div *ngFor="let g of genres" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[#1f1f1f]" style="background:#1a1a1a;border:1px solid #2a2a2a;">
          <span *ngIf="editingId !== g.id" class="flex-1 text-sm text-white">{{ g.name }}</span>
          <input *ngIf="editingId === g.id" [(ngModel)]="editName" (keyup.enter)="saveEdit(g)"
            class="flex-1 px-2 py-1 rounded text-sm text-white" style="background:#111;border:1px solid #D4A017;" />
          <div class="flex gap-2">
            <button *ngIf="editingId !== g.id" (click)="startEdit(g)" class="text-xs px-2 py-1 rounded" style="background:#2a2a2a;color:#ccc;">Editar</button>
            <button *ngIf="editingId === g.id" (click)="saveEdit(g)" class="text-xs px-2 py-1 rounded" style="background:#D4A017;color:#080808;">Guardar</button>
            <button *ngIf="editingId === g.id" (click)="editingId = null" class="text-xs px-2 py-1 rounded" style="background:#2a2a2a;color:#888;">Cancelar</button>
            <button *ngIf="editingId !== g.id" (click)="remove(g)" class="text-xs px-2 py-1 rounded" style="background:#3a1a1a;color:#ff6b6b;">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminGenresComponent implements OnInit {
  genres: Genre[] = [];
  newName = '';
  editingId: number | null = null;
  editName = '';
  saving = false;

  constructor(private genreService: GenreService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.genreService.getAll().subscribe((p) => (this.genres = p.content));
  }

  create(): void {
    if (!this.newName.trim()) return;
    this.saving = true;
    this.genreService.create(this.newName.trim()).subscribe({
      next: () => { this.newName = ''; this.saving = false; this.load(); },
      error: () => (this.saving = false),
    });
  }

  startEdit(g: Genre): void { this.editingId = g.id; this.editName = g.name; }

  saveEdit(g: Genre): void {
    if (!this.editName.trim()) return;
    this.genreService.update(g.id, this.editName.trim()).subscribe({
      next: () => { this.editingId = null; this.load(); },
    });
  }

  remove(g: Genre): void {
    if (!confirm(`¿Eliminar género "${g.name}"?`)) return;
    this.genreService.delete(g.id).subscribe(() => this.load());
  }
}
