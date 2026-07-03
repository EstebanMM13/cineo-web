import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenreService } from '../../core/services/genre.service';
import { NotificationService } from '../../core/services/notification.service';
import { Genre } from '../../core/models/models';

@Component({
  selector: 'app-admin-genres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .genre-card {
      background: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 10px;
      padding: 14px 16px; display: flex; align-items: center; gap: 12px;
      transition: border-color 0.2s;
    }
    .genre-card:hover { border-color: #252525; }
    .genre-card:hover .card-actions { opacity: 1; }
    .card-actions { display: flex; gap: 6px; opacity: 0; transition: opacity 0.15s; margin-left: auto; flex-shrink: 0; }
    .btn-sm-edit {
      padding: 5px 11px; border-radius: 6px; font-size: 11px; font-weight: 500;
      background: #141414; color: #555; border: 1px solid #1e1e1e;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-sm-edit:hover { color: #ccc; border-color: #2a2a2a; }
    .btn-sm-del {
      padding: 5px 9px; border-radius: 6px; font-size: 11px;
      background: rgba(255,80,80,0.06); color: #ff6b6b;
      border: 1px solid rgba(255,80,80,0.12); cursor: pointer; transition: all 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .btn-sm-del:hover { background: rgba(255,80,80,0.14); }
    .edit-input {
      flex: 1; padding: 6px 10px; border-radius: 6px; font-size: 13px;
      color: #e8e8e8; background: #0a0a0a;
      border: 1px solid rgba(212,160,23,0.4); outline: none;
    }
    .add-input {
      padding: 9px 14px; border-radius: 8px; font-size: 13px;
      color: #e8e8e8; background: #0a0a0a; border: 1px solid #1e1e1e;
      outline: none; flex: 1; transition: border-color 0.2s;
    }
    .add-input:focus { border-color: rgba(212,160,23,0.35); }
    .btn-add {
      padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
      background: var(--color-cinema-gold); color: #080808; border: none;
      cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;
      transition: opacity 0.2s;
    }
    .btn-add:disabled { opacity: 0.4; cursor: not-allowed; }
    .confirm-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      backdrop-filter: blur(6px); z-index: 200;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .confirm-card {
      background: #0f0f0f; border: 1px solid #222; border-radius: 14px;
      padding: 28px; max-width: 360px; width: 100%;
      box-shadow: 0 40px 80px rgba(0,0,0,0.8);
    }
  `],
  template: `
    <div>
      <div style="margin-bottom:28px;">
        <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 4px;">Géneros</h1>
        <p style="font-size:13px;color:#3a3a3a;margin:0;">{{ genres().length }} géneros registrados</p>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:28px;max-width:460px;">
        <input [(ngModel)]="newName" (keyup.enter)="create()" placeholder="Nombre del nuevo género..." class="add-input" />
        <button (click)="create()" [disabled]="!newName.trim() || saving()" class="btn-add">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Añadir
        </button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">

        <div *ngFor="let g of genres()" class="genre-card">
          <div style="width:30px;height:30px;border-radius:7px;background:rgba(212,160,23,0.06);border:1px solid rgba(212,160,23,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-cinema-gold)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>

          <span *ngIf="editingId() !== g.id" style="font-size:13px;font-weight:500;color:#bbb;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            {{ g.name }}
          </span>
          <input *ngIf="editingId() === g.id"
            [(ngModel)]="editName"
            (keyup.enter)="saveEdit(g)"
            (keyup.escape)="editingId.set(null)"
            class="edit-input" />

          <div class="card-actions" *ngIf="editingId() !== g.id">
            <button (click)="startEdit(g)" class="btn-sm-edit">Editar</button>
            <button (click)="askDelete(g)" class="btn-sm-del">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div *ngIf="editingId() === g.id" style="display:flex;gap:6px;margin-left:auto;flex-shrink:0;">
            <button (click)="saveEdit(g)" style="padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;background:var(--color-cinema-gold);color:#080808;border:none;cursor:pointer;">OK</button>
            <button (click)="editingId.set(null)" style="padding:5px 10px;border-radius:6px;font-size:11px;background:#141414;color:#555;border:1px solid #1e1e1e;cursor:pointer;">✕</button>
          </div>
        </div>

        <div *ngIf="genres().length === 0" style="grid-column:1/-1;padding:56px;text-align:center;color:#2a2a2a;font-size:13px;">
          No hay géneros. Añade el primero arriba.
        </div>
      </div>

      <!-- Delete confirm -->
      <div *ngIf="toDelete()" class="confirm-overlay" (click)="toDelete.set(null)">
        <div class="confirm-card" (click)="$event.stopPropagation()">
          <h3 style="font-size:15px;font-weight:700;color:#fff;margin:0 0 8px;">Eliminar género</h3>
          <p style="font-size:13px;color:#555;margin:0 0 20px;line-height:1.6;">
            ¿Eliminar el género <strong style="color:#888;font-weight:600;">"{{ toDelete()?.name }}"</strong>?
          </p>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button (click)="toDelete.set(null)" style="padding:8px 16px;border-radius:8px;font-size:13px;background:#141414;color:#666;border:1px solid #1e1e1e;cursor:pointer;">Cancelar</button>
            <button (click)="confirmDelete()" style="padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;background:rgba(255,80,80,0.1);color:#ff6b6b;border:1px solid rgba(255,80,80,0.18);cursor:pointer;">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminGenresComponent implements OnInit {
  readonly genres = signal<Genre[]>([]);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly toDelete = signal<Genre | null>(null);

  newName = '';
  editName = '';

  constructor(private genreService: GenreService, private notify: NotificationService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.genreService.getAll().subscribe((p) => this.genres.set(p.content));
  }

  create(): void {
    if (!this.newName.trim()) return;
    this.saving.set(true);
    const name = this.newName.trim();
    this.genreService.create(name).subscribe({
      next: () => {
        this.notify.success(`Género "${name}" creado.`);
        this.newName = '';
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  startEdit(g: Genre): void { this.editingId.set(g.id); this.editName = g.name; }

  saveEdit(g: Genre): void {
    if (!this.editName.trim()) return;
    this.genreService.update(g.id, this.editName.trim()).subscribe({
      next: () => {
        this.notify.success('Género actualizado.');
        this.editingId.set(null);
        this.load();
      },
    });
  }

  askDelete(g: Genre): void { this.toDelete.set(g); }

  confirmDelete(): void {
    const target = this.toDelete();
    if (!target) return;
    const name = target.name;
    this.genreService.delete(target.id).subscribe({
      next: () => {
        this.notify.success(`Género "${name}" eliminado.`);
        this.toDelete.set(null);
        this.load();
      },
      error: () => this.toDelete.set(null),
    });
  }
}
