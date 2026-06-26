import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MovieService } from '../../core/services/movie.service';
import { GenreService } from '../../core/services/genre.service';
import { Movie, Genre } from '../../core/models/models';
import { MovieCardComponent } from '../../shared/movie-card/movie-card';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, PaginationComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">

      <div class="flex flex-wrap gap-2 mb-6">
        <button
          (click)="selectGenre(null)"
          class="px-3 py-1 rounded-full text-sm transition-colors"
          [style]="!activeGenre ? 'background:#e50914;color:#fff;' : 'background:#1a1a1a;color:#888;border:1px solid #2a2a2a;'"
        >Todos</button>
        <button
          *ngFor="let g of genres"
          (click)="selectGenre(g.name)"
          class="px-3 py-1 rounded-full text-sm transition-colors"
          [style]="activeGenre === g.name ? 'background:#e50914;color:#fff;' : 'background:#1a1a1a;color:#888;border:1px solid #2a2a2a;'"
        >{{ g.name }}</button>
      </div>

      <div *ngIf="searchQuery" class="mb-4 text-sm" style="color:#888;">
        Resultados para "<span class="text-white">{{ searchQuery }}</span>"
        <button (click)="clearSearch()" class="ml-2 underline" style="color:#e50914;">Limpiar</button>
      </div>

      <div *ngIf="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-2" style="border-color:#e50914;border-top-color:transparent;"></div>
      </div>

      <div *ngIf="!loading && movies.length === 0" class="text-center py-20" style="color:#888;">
        No se encontraron películas.
      </div>

      <div *ngIf="!loading && movies.length > 0" class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
        <app-movie-card *ngFor="let m of movies" [movie]="m" />
      </div>

      <app-pagination
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        (pageChange)="onPageChange($event)"
      />
    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  genres: Genre[] = [];
  loading = false;
  currentPage = 0;
  totalPages = 0;
  activeGenre: string | null = null;
  searchQuery = '';
  private destroy$ = new Subject<void>();

  constructor(
    private movieService: MovieService,
    private genreService: GenreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.searchQuery = params['q'] ?? '';
      this.currentPage = 0;
      this.activeGenre = null;
      this.loadMovies();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMovies(): void {
    this.loading = true;
    const obs = this.searchQuery
      ? this.movieService.searchByTitle(this.searchQuery, this.currentPage)
      : this.activeGenre
      ? this.movieService.getByGenre(this.activeGenre, this.currentPage)
      : this.movieService.getAll(this.currentPage);

    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: (page) => {
        this.movies = page.content;
        this.totalPages = page.totalPages;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadGenres(): void {
    this.genreService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (page) => (this.genres = page.content),
    });
  }

  selectGenre(name: string | null): void {
    this.activeGenre = name;
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadMovies();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadMovies();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo(0, 0);
    this.loadMovies();
  }
}
