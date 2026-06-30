import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, distinctUntilChanged, switchMap, takeUntil, map } from 'rxjs';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/models';
import { MovieCardComponent } from '../../shared/movie-card/movie-card';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, PaginationComponent],
  styles: [`
    .movie-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:20px; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .spinner { width:32px; height:32px; border:2px solid rgba(212,160,23,0.15); border-top-color:#D4A017; border-radius:50%; animation:spin 0.8s linear infinite; }
  `],
  template: `
    <div style="max-width:1280px;margin:0 auto;padding:32px 24px;">

      <!-- Context bar -->
      <div *ngIf="searchQuery || activeGenre" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <div>
          <div style="font-size:11px;font-weight:600;color:#3a3a3a;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
            {{ searchQuery ? 'Resultados de búsqueda' : 'Género' }}
          </div>
          <div style="font-size:18px;font-weight:600;color:#e8e8e8;">
            "{{ searchQuery || activeGenre }}"
            <span *ngIf="totalMovies > 0" style="font-size:13px;font-weight:400;color:#3a3a3a;margin-left:8px;">{{ totalMovies }} película{{ totalMovies !== 1 ? 's' : '' }}</span>
          </div>
        </div>
        <button (click)="clearFilters()" style="display:flex;align-items:center;gap:6px;font-size:13px;color:#555;background:transparent;border:1px solid #1e1e1e;border-radius:8px;padding:7px 12px;cursor:pointer;transition:color 0.2s,border-color 0.2s;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Limpiar
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" style="display:flex;justify-content:center;padding:96px 0;">
        <div class="spinner"></div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && movies.length === 0" style="display:flex;flex-direction:column;align-items:center;padding:96px 0;gap:16px;">
        <div style="width:60px;height:60px;border-radius:16px;background:rgba(212,160,23,0.06);border:1px solid rgba(212,160,23,0.1);display:flex;align-items:center;justify-content:center;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D4A017" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4;">
            <rect x="2" y="2" width="20" height="20" rx="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        </div>
        <p style="font-size:13px;color:#3a3a3a;margin:0;">No se encontraron películas.</p>
      </div>

      <!-- Grid -->
      <div *ngIf="!loading && movies.length > 0" class="movie-grid">
        <app-movie-card *ngFor="let m of movies; trackBy: trackByMovie" [movie]="m" />
      </div>

      <app-pagination [currentPage]="currentPage" [totalPages]="totalPages" (pageChange)="onPageChange($event)" />
    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  loading = false;
  currentPage = 0;
  totalPages = 0;
  totalMovies = 0;
  searchQuery = '';
  activeGenre: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      map((p) => ({ q: p['q'] ?? '', genre: p['genre'] ?? '' })),
      distinctUntilChanged((a, b) => a.q === b.q && a.genre === b.genre),
      switchMap(({ q, genre }) => {
        this.searchQuery = q;
        this.activeGenre = genre || null;
        this.currentPage = 0;
        this.loading = true;
        this.cdr.detectChanges();
        if (q) return this.movieService.searchByTitle(q, 0);
        if (genre) return this.movieService.getByGenre(genre, 0);
        return this.movieService.getAll(0);
      })
    ).subscribe({
      next: (page) => {
        this.movies = page.content;
        this.totalPages = page.totalPages;
        this.totalMovies = page.totalElements;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadMovies(): void {
    this.loading = true;
    this.cdr.detectChanges();
    const obs = this.searchQuery
      ? this.movieService.searchByTitle(this.searchQuery, this.currentPage)
      : this.activeGenre
      ? this.movieService.getByGenre(this.activeGenre, this.currentPage)
      : this.movieService.getAll(this.currentPage);

    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: (page) => {
        this.movies = page.content;
        this.totalPages = page.totalPages;
        this.totalMovies = page.totalElements;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
  }

  clearFilters(): void { this.router.navigate(['/']); }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadMovies();
  }

  trackByMovie(_: number, m: Movie): number { return m.id; }
}
