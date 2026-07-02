import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { GenreService } from '../../core/services/genre.service';
import { Movie, Genre, MovieRequest } from '../../core/models/models';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-admin-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold text-white">Películas</h2>
        <button (click)="openCreate()" class="px-4 py-2 rounded text-sm font-medium" style="background:#D4A017;color:#080808;">
          + Nueva película
        </button>
      </div>

      <div *ngIf="showForm" class="mb-6 p-5 rounded-lg" style="background:#1a1a1a;border:1px solid #2a2a2a;">
        <h3 class="text-sm font-semibold text-white mb-4">{{ editing ? 'Editar película' : 'Nueva película' }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs mb-1" style="color:#888;">Título *</label>
            <input [(ngModel)]="form.title" class="w-full px-3 py-2 rounded text-sm text-white" style="background:#111;border:1px solid #2a2a2a;" />
          </div>
          <div>
            <label class="block text-xs mb-1" style="color:#888;">Año *</label>
            <input [(ngModel)]="form.movieYear" type="number" class="w-full px-3 py-2 rounded text-sm text-white" style="background:#111;border:1px solid #2a2a2a;" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs mb-1" style="color:#888;">Descripción</label>
            <textarea [(ngModel)]="form.description" rows="2" class="w-full px-3 py-2 rounded text-sm text-white resize-none" style="background:#111;border:1px solid #2a2a2a;"></textarea>
          </div>
          <div class="col-span-2">
            <label class="block text-xs mb-1" style="color:#888;">URL imagen (póster)</label>
            <input [(ngModel)]="form.imageUrl" class="w-full px-3 py-2 rounded text-sm text-white" style="background:#111;border:1px solid #2a2a2a;" />
            <div *ngIf="form.imageUrl" class="mt-2 flex items-center gap-3">
              <img [src]="form.imageUrl" alt="Preview" class="h-20 rounded object-cover" style="aspect-ratio:2/3;" (error)="imgPreviewError=true" />
              <span *ngIf="imgPreviewError" class="text-xs" style="color:#888;">No se puede cargar la imagen</span>
            </div>
          </div>
          <div class="col-span-2">
            <label class="block text-xs mb-2" style="color:#888;">Géneros</label>
            <div class="flex flex-wrap gap-2">
              <label *ngFor="let g of allGenres" class="flex items-center gap-1.5 text-sm cursor-pointer" style="color:#ccc;">
                <input type="checkbox" [checked]="form.genreIds.includes(g.id)" (change)="toggleGenre(g.id)" />
                {{ g.name }}
              </label>
            </div>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button (click)="save()" [disabled]="saving" class="px-4 py-2 rounded text-sm font-medium disabled:opacity-40" style="background:#D4A017;color:#080808;">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
          <button (click)="showForm = false" class="px-4 py-2 rounded text-sm" style="background:#2a2a2a;color:#888;">Cancelar</button>
        </div>
      </div>

      <div *ngIf="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2" style="border-color:#D4A017;border-top-color:transparent;"></div>
      </div>

      <div *ngIf="!loading" class="rounded-lg overflow-hidden" style="border:1px solid #2a2a2a;">
        <table class="w-full text-sm">
          <thead style="background:#1a1a1a;">
            <tr>
              <th class="text-left px-4 py-3 font-medium" style="color:#888;">Título</th>
              <th class="text-left px-4 py-3 font-medium" style="color:#888;">Año</th>
              <th class="text-left px-4 py-3 font-medium" style="color:#888;">Rating</th>
              <th class="text-left px-4 py-3 font-medium" style="color:#888;">Votos</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of movies" class="transition-colors hover:bg-[#1f1f1f]" style="border-top:1px solid #2a2a2a;">
              <td class="px-4 py-3 text-white font-medium">{{ m.title }}</td>
              <td class="px-4 py-3" style="color:#888;">{{ m.movieYear }}</td>
              <td class="px-4 py-3" style="color:#D4A017;">&#9733; {{ m.rating | number:'1.1-1' }}</td>
              <td class="px-4 py-3" style="color:#888;">{{ m.votes }}</td>
              <td class="px-4 py-3 flex gap-2 justify-end">
                <button (click)="openEdit(m)" class="text-xs px-2 py-1 rounded transition-colors" style="background:#2a2a2a;color:#ccc;">Editar</button>
                <button (click)="remove(m)" class="text-xs px-2 py-1 rounded transition-colors" style="background:#3a1a1a;color:#ff6b6b;">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-pagination [currentPage]="page" [totalPages]="totalPages" (pageChange)="onPage($event)" />
    </div>
  `,
})
export class AdminMoviesComponent implements OnInit {
  movies: Movie[] = [];
  allGenres: Genre[] = [];
  loading = false;
  saving = false;
  showForm = false;
  editing: Movie | null = null;
  page = 0;
  totalPages = 0;

  form: MovieRequest = { title: '', description: '', movieYear: new Date().getFullYear(), imageUrl: '', genreIds: [] };
  imgPreviewError = false;

  constructor(private movieService: MovieService, private genreService: GenreService) {}

  ngOnInit(): void {
    this.load();
    this.genreService.getAll().subscribe((p) => (this.allGenres = p.content));
  }

  load(): void {
    this.loading = true;
    this.movieService.getAll(this.page).subscribe({
      next: (p) => { this.movies = p.content; this.totalPages = p.totalPages; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  openCreate(): void {
    this.editing = null;
    this.form = { title: '', description: '', movieYear: new Date().getFullYear(), imageUrl: '', genreIds: [] };
    this.imgPreviewError = false;
    this.showForm = true;
  }

  openEdit(m: Movie): void {
    this.editing = m;
    this.form = { title: m.title, description: m.description, movieYear: m.movieYear, imageUrl: m.imageUrl, genreIds: m.genres.map((g) => g.id) };
    this.imgPreviewError = false;
    this.showForm = true;
  }

  toggleGenre(id: number): void {
    const idx = this.form.genreIds.indexOf(id);
    if (idx >= 0) this.form.genreIds.splice(idx, 1);
    else this.form.genreIds.push(id);
  }

  save(): void {
    this.saving = true;
    const obs = this.editing
      ? this.movieService.update(this.editing.id, this.form)
      : this.movieService.create(this.form);
    obs.subscribe({
      next: () => { this.showForm = false; this.saving = false; this.load(); },
      error: () => (this.saving = false),
    });
  }

  remove(m: Movie): void {
    if (!confirm(`¿Eliminar "${m.title}"?`)) return;
    this.movieService.delete(m.id).subscribe(() => this.load());
  }

  onPage(p: number): void { this.page = p; this.load(); }
}
