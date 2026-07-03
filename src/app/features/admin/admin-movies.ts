import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { GenreService } from '../../core/services/genre.service';
import { NotificationService } from '../../core/services/notification.service';
import { Movie, Genre, MovieRequest } from '../../core/models/models';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-admin-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      backdrop-filter: blur(6px); z-index: 200;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .modal-card {
      background: #0f0f0f; border: 1px solid #222; border-radius: 16px;
      width: 100%; max-width: 660px; max-height: 90vh;
      overflow: hidden; display: flex; flex-direction: column;
      box-shadow: 0 40px 80px rgba(0,0,0,0.8);
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
    }
    .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
    .modal-footer {
      padding: 16px 24px; border-top: 1px solid #1a1a1a;
      display: flex; justify-content: flex-end; gap: 8px; flex-shrink: 0;
    }
    .field-label {
      display: block; font-size: 11px; font-weight: 600;
      color: #444; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
    }
    .field-input {
      width: 100%; padding: 9px 12px; border-radius: 8px;
      font-size: 13px; color: #e8e8e8; background: #0a0a0a;
      border: 1px solid #1e1e1e; outline: none; transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .field-input:focus { border-color: rgba(212,160,23,0.4); }
    .btn-primary {
      padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
      background: var(--color-cinema-gold); color: #080808; border: none; cursor: pointer;
      display: flex; align-items: center; gap: 6px; transition: opacity 0.2s;
    }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-secondary {
      padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
      background: #141414; color: #666; border: 1px solid #222; cursor: pointer;
    }
    .btn-edit {
      padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 500;
      background: #141414; color: #666; border: 1px solid #1e1e1e; cursor: pointer;
      transition: all 0.15s;
    }
    .btn-edit:hover { color: #ccc; border-color: #2a2a2a; }
    .btn-danger {
      padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 500;
      background: rgba(255,80,80,0.07); color: #ff6b6b;
      border: 1px solid rgba(255,80,80,0.13); cursor: pointer; transition: all 0.15s;
    }
    .btn-danger:hover { background: rgba(255,80,80,0.15); }
    .genre-chip {
      display: inline-block; padding: 2px 8px; border-radius: 5px; font-size: 11px;
      background: rgba(212,160,23,0.07); color: rgba(212,160,23,0.6);
      border: 1px solid rgba(212,160,23,0.12);
    }
    .genre-check {
      display: flex; align-items: center; gap: 7px; padding: 6px 10px;
      border-radius: 7px; cursor: pointer; font-size: 12px; color: #666;
      transition: background 0.15s; user-select: none;
    }
    .genre-check:hover { background: rgba(255,255,255,0.03); color: #aaa; }
    .search-wrap { position: relative; }
    .search-input {
      padding: 9px 14px 9px 38px; border-radius: 10px; font-size: 13px;
      color: #e8e8e8; background: #0a0a0a; border: 1px solid #1e1e1e;
      outline: none; width: 260px; transition: border-color 0.2s;
    }
    .search-input:focus { border-color: rgba(212,160,23,0.3); }
    .tbl-row { border-bottom: 1px solid #141414; transition: background 0.12s; }
    .tbl-row:hover td { background: rgba(255,255,255,0.012); }
    .confirm-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      backdrop-filter: blur(6px); z-index: 300;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .confirm-card {
      background: #0f0f0f; border: 1px solid #222; border-radius: 14px;
      padding: 28px; max-width: 380px; width: 100%;
      box-shadow: 0 40px 80px rgba(0,0,0,0.8);
    }
  `],
  template: `
    <!-- Page header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;">
      <div>
        <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 4px;">Películas</h1>
        <p style="font-size:13px;color:#3a3a3a;margin:0;">{{ totalElements() }} películas en total</p>
      </div>
      <button (click)="openCreate()" class="btn-primary">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nueva película
      </button>
    </div>

    <!-- Search bar -->
    <div class="search-wrap" style="margin-bottom:16px;">
      <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="Buscar por título..." class="search-input" />
    </div>

    <!-- Table -->
    <div style="border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#0a0a0a;border-bottom:1px solid #1a1a1a;">
            <th style="text-align:left;padding:12px 16px;font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;">Película</th>
            <th style="text-align:left;padding:12px 16px;font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;">Géneros</th>
            <th style="text-align:left;padding:12px 16px;font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;">Rating</th>
            <th style="text-align:left;padding:12px 16px;font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;">Votos</th>
            <th style="padding:12px 16px;"></th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton -->
          <ng-container *ngIf="loading()">
            <tr *ngFor="let i of skeletonRows" style="border-bottom:1px solid #141414;">
              <td style="padding:12px 16px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:36px;height:54px;border-radius:6px;background:#141414;flex-shrink:0;"></div>
                  <div>
                    <div style="height:12px;width:130px;border-radius:4px;background:#141414;margin-bottom:6px;"></div>
                    <div style="height:10px;width:36px;border-radius:4px;background:#111;"></div>
                  </div>
                </div>
              </td>
              <td style="padding:12px 16px;"><div style="height:20px;width:70px;border-radius:5px;background:#141414;"></div></td>
              <td style="padding:12px 16px;"><div style="height:12px;width:38px;border-radius:4px;background:#141414;"></div></td>
              <td style="padding:12px 16px;"><div style="height:12px;width:28px;border-radius:4px;background:#141414;"></div></td>
              <td></td>
            </tr>
          </ng-container>

          <!-- Data rows -->
          <tr *ngFor="let m of movies()" class="tbl-row">
            <td style="padding:12px 16px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:36px;height:54px;border-radius:6px;overflow:hidden;background:#141414;flex-shrink:0;border:1px solid #1a1a1a;">
                  <img *ngIf="m.imageUrl" [src]="m.imageUrl" [alt]="m.title"
                    style="width:100%;height:100%;object-fit:cover;" (error)="onImgErr($event)" />
                  <div *ngIf="!m.imageUrl" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" stroke-width="1.5" stroke-linecap="round">
                      <rect x="2" y="2" width="20" height="20" rx="2"/>
                      <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
                    </svg>
                  </div>
                </div>
                <div style="min-width:0;">
                  <p style="font-size:13px;font-weight:600;color:#e8e8e8;margin:0 0 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">{{ m.title }}</p>
                  <p style="font-size:11px;color:#2a2a2a;margin:0;">{{ m.movieYear }}</p>
                </div>
              </div>
            </td>
            <td style="padding:12px 16px;">
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                <span *ngFor="let g of (m.genres || []).slice(0,3)" class="genre-chip">{{ g.name }}</span>
                <span *ngIf="(m.genres || []).length > 3" class="genre-chip">+{{ m.genres.length - 3 }}</span>
              </div>
            </td>
            <td style="padding:12px 16px;">
              <div style="display:flex;align-items:center;gap:4px;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="color:var(--color-cinema-gold);">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span style="font-size:13px;font-weight:600;color:var(--color-cinema-gold);">{{ m.rating | number:'1.1-1' }}</span>
              </div>
            </td>
            <td style="padding:12px 16px;font-size:12px;color:#2a2a2a;">{{ m.votes }}</td>
            <td style="padding:12px 16px;">
              <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;">
                <button (click)="openEdit(m)" class="btn-edit">Editar</button>
                <button (click)="askDelete(m)" class="btn-danger">Eliminar</button>
              </div>
            </td>
          </tr>

          <!-- Empty -->
          <tr *ngIf="!loading() && movies().length === 0">
            <td colspan="5" style="padding:56px 16px;text-align:center;font-size:13px;color:#2a2a2a;">
              No hay películas que mostrar.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-pagination [currentPage]="page" [totalPages]="totalPages()" (pageChange)="onPage($event)" />

    <!-- ── Movie form modal ── -->
    <div *ngIf="showForm()" class="modal-overlay" (click)="closeForm()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 style="font-size:16px;font-weight:700;color:#fff;margin:0;">
            {{ editing ? 'Editar película' : 'Nueva película' }}
          </h2>
          <button (click)="closeForm()" style="background:none;border:none;cursor:pointer;color:#444;padding:4px;display:flex;align-items:center;border-radius:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="display:grid;grid-template-columns:1fr 110px;gap:20px;align-items:start;">
            <div style="display:flex;flex-direction:column;gap:16px;">
              <div>
                <label class="field-label">Título *</label>
                <input [(ngModel)]="form.title" class="field-input" placeholder="Título de la película" />
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label class="field-label">Año *</label>
                  <input [(ngModel)]="form.movieYear" type="number" class="field-input" placeholder="2024" />
                </div>
                <div>
                  <label class="field-label">URL del póster</label>
                  <input [(ngModel)]="form.imageUrl" class="field-input" placeholder="https://..." (ngModelChange)="imgPreviewError.set(false)" />
                </div>
              </div>
              <div>
                <label class="field-label">Descripción</label>
                <textarea [(ngModel)]="form.description" rows="3" class="field-input" style="resize:none;" placeholder="Sinopsis de la película..."></textarea>
              </div>
              <div>
                <label class="field-label">Géneros</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:8px;padding:6px;max-height:180px;overflow-y:auto;">
                  <label *ngFor="let g of allGenres()" class="genre-check">
                    <input type="checkbox" [checked]="form.genreIds.includes(g.id)" (change)="toggleGenre(g.id)" style="accent-color:var(--color-cinema-gold);flex-shrink:0;" />
                    {{ g.name }}
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label class="field-label">Preview</label>
              <div style="width:110px;height:165px;border-radius:10px;overflow:hidden;background:#0a0a0a;border:1px solid #1a1a1a;display:flex;align-items:center;justify-content:center;">
                <img *ngIf="form.imageUrl && !imgPreviewError()" [src]="form.imageUrl"
                  style="width:100%;height:100%;object-fit:cover;" (error)="imgPreviewError.set(true)" />
                <svg *ngIf="!form.imageUrl || imgPreviewError()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="1" stroke-linecap="round">
                  <rect x="2" y="2" width="20" height="20" rx="2"/>
                  <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button (click)="closeForm()" class="btn-secondary">Cancelar</button>
          <button (click)="save()" [disabled]="saving() || !form.title.trim()" class="btn-primary">
            {{ saving() ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear película' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Delete confirm ── -->
    <div *ngIf="toDelete()" class="confirm-overlay" (click)="toDelete.set(null)">
      <div class="confirm-card" (click)="$event.stopPropagation()">
        <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 style="font-size:15px;font-weight:700;color:#fff;margin:0 0 8px;">Eliminar película</h3>
        <p style="font-size:13px;color:#555;margin:0 0 20px;line-height:1.6;">
          ¿Estás seguro de que quieres eliminar <strong style="color:#888;font-weight:600;">"{{ toDelete()?.title }}"</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button (click)="toDelete.set(null)" class="btn-secondary">Cancelar</button>
          <button (click)="confirmDelete()" style="padding:9px 20px;border-radius:8px;font-size:13px;font-weight:600;background:rgba(255,80,80,0.12);color:#ff6b6b;border:1px solid rgba(255,80,80,0.2);cursor:pointer;">Eliminar</button>
        </div>
      </div>
    </div>
  `,
})
export class AdminMoviesComponent implements OnInit, OnDestroy {
  readonly movies = signal<Movie[]>([]);
  readonly allGenres = signal<Genre[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly toDelete = signal<Movie | null>(null);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly imgPreviewError = signal(false);

  editing: Movie | null = null;
  page = 0;
  searchQuery = '';
  readonly skeletonRows = Array(6).fill(0);

  form: MovieRequest = { title: '', description: '', movieYear: new Date().getFullYear(), imageUrl: '', genreIds: [] };

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private movieService: MovieService,
    private genreService: GenreService,
    private notify: NotificationService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.genreService.getAll().subscribe((p) => this.allGenres.set(p.content));
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  load(): void {
    this.loading.set(true);
    const obs = this.searchQuery.trim()
      ? this.movieService.searchByTitle(this.searchQuery.trim(), this.page)
      : this.movieService.getAll(this.page);
    obs.subscribe({
      next: (p) => {
        this.movies.set(p.content);
        this.totalPages.set(p.totalPages);
        this.totalElements.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 0; this.load(); }, 350);
  }

  openCreate(): void {
    this.editing = null;
    this.form = { title: '', description: '', movieYear: new Date().getFullYear(), imageUrl: '', genreIds: [] };
    this.imgPreviewError.set(false);
    this.showForm.set(true);
  }

  openEdit(m: Movie): void {
    this.editing = m;
    this.form = {
      title: m.title,
      description: m.description,
      movieYear: m.movieYear,
      imageUrl: m.imageUrl,
      genreIds: m.genres.map((g) => g.id),
    };
    this.imgPreviewError.set(false);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  toggleGenre(id: number): void {
    const idx = this.form.genreIds.indexOf(id);
    if (idx >= 0) this.form.genreIds.splice(idx, 1);
    else this.form.genreIds.push(id);
  }

  save(): void {
    if (!this.form.title.trim()) return;
    this.saving.set(true);
    const obs = this.editing
      ? this.movieService.update(this.editing.id, this.form)
      : this.movieService.create(this.form);
    obs.subscribe({
      next: () => {
        this.notify.success(this.editing ? `"${this.form.title}" actualizada.` : `"${this.form.title}" creada.`);
        this.showForm.set(false);
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  askDelete(m: Movie): void { this.toDelete.set(m); }

  confirmDelete(): void {
    const target = this.toDelete();
    if (!target) return;
    const title = target.title;
    this.movieService.delete(target.id).subscribe({
      next: () => {
        this.notify.success(`"${title}" eliminada.`);
        this.toDelete.set(null);
        this.load();
      },
      error: () => this.toDelete.set(null),
    });
  }

  onImgErr(e: Event): void {
    (e.target as HTMLImageElement).style.display = 'none';
  }

  onPage(p: number): void { this.page = p; this.load(); }
}
