import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { Movie, Review } from '../../core/models/models';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-2" style="border-color:#e50914;border-top-color:transparent;"></div>
    </div>

    <div *ngIf="movie && !loading">
      <div class="relative h-72 overflow-hidden" style="background:#111;">
        <img *ngIf="movie.imageUrl" [src]="movie.imageUrl" [alt]="movie.title" class="w-full h-full object-cover opacity-30" />
        <div class="absolute inset-0" style="background:linear-gradient(to top, #0a0a0a 40%, transparent);"></div>
      </div>

      <div class="max-w-5xl mx-auto px-4 -mt-32 relative z-10">
        <div class="flex gap-6">
          <div class="shrink-0 w-40 rounded-lg overflow-hidden shadow-2xl" style="border:2px solid #2a2a2a;">
            <img *ngIf="movie.imageUrl; else noPoster" [src]="movie.imageUrl" [alt]="movie.title" class="w-full aspect-[2/3] object-cover" />
            <ng-template #noPoster>
              <div class="w-full aspect-[2/3] flex items-center justify-center text-5xl" style="background:#1a1a1a;color:#333;">&#127916;</div>
            </ng-template>
          </div>

          <div class="flex-1 pt-8">
            <h1 class="text-3xl font-bold text-white">{{ movie.title }}</h1>
            <p class="mt-1 text-sm" style="color:#888;">{{ movie.movieYear }}</p>

            <div class="flex flex-wrap gap-2 mt-3">
              <span *ngFor="let g of movie.genres" class="text-xs px-2 py-1 rounded" style="background:#2a2a2a;color:#ccc;">{{ g.name }}</span>
            </div>

            <p class="mt-4 text-sm leading-relaxed" style="color:#ccc;">{{ movie.description }}</p>

            <div class="flex items-center gap-6 mt-6">
              <div class="flex items-center gap-2">
                <span class="text-2xl" style="color:#f5c518;">&#9733;</span>
                <span class="text-2xl font-bold text-white">{{ movie.rating | number:'1.1-1' }}</span>
                <span class="text-sm" style="color:#888;">/ 10 ({{ movie.votes }} votos)</span>
              </div>

              <div *ngIf="isLoggedIn && !hasVoted" class="flex items-center gap-2">
                <span class="text-sm" style="color:#888;">Tu voto:</span>
                <div class="flex gap-1">
                  <button
                    *ngFor="let n of [1,2,3,4,5,6,7,8,9,10]"
                    (click)="vote(n)"
                    class="w-7 h-7 rounded text-xs font-bold transition-colors"
                    [style]="hoverRating >= n ? 'background:#e50914;color:#fff;' : 'background:#2a2a2a;color:#888;'"
                    (mouseenter)="hoverRating = n"
                    (mouseleave)="hoverRating = 0"
                  >{{ n }}</button>
                </div>
              </div>
              <span *ngIf="hasVoted" class="text-sm" style="color:#e50914;">Ya has votado esta película</span>
              <span *ngIf="!isLoggedIn" class="text-sm" style="color:#888;">Inicia sesión para votar</span>
            </div>
          </div>
        </div>

        <div class="mt-12">
          <h2 class="text-xl font-semibold text-white mb-4">Reseñas ({{ totalReviews }})</h2>

          <div *ngIf="isLoggedIn" class="mb-6 p-4 rounded-lg" style="background:#1a1a1a;border:1px solid #2a2a2a;">
            <textarea
              [(ngModel)]="newComment"
              placeholder="Escribe tu reseña..."
              rows="3"
              class="w-full p-3 rounded text-sm text-white outline-none resize-none"
              style="background:#111;border:1px solid #2a2a2a;"
            ></textarea>
            <div class="flex justify-end mt-2">
              <button
                (click)="submitReview()"
                [disabled]="!newComment.trim() || submitting"
                class="px-4 py-2 rounded text-sm font-medium disabled:opacity-40 transition-opacity"
                style="background:#e50914;color:#fff;"
              >{{ submitting ? 'Enviando...' : 'Publicar reseña' }}</button>
            </div>
          </div>

          <div *ngIf="reviews.length === 0 && !loadingReviews" class="text-sm py-4" style="color:#888;">
            Todavía no hay reseñas. ¡Sé el primero!
          </div>

          <div class="flex flex-col gap-4">
            <div *ngFor="let r of reviews" class="p-4 rounded-lg" style="background:#1a1a1a;border:1px solid #2a2a2a;">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-white">{{ r.username }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs" style="color:#666;">{{ r.createdAt }}</span>
                  <button
                    *ngIf="canEditReview(r)"
                    (click)="deleteReview(r)"
                    class="text-xs hover:text-red-400 transition-colors"
                    style="color:#666;"
                  >Eliminar</button>
                </div>
              </div>
              <p class="text-sm" style="color:#ccc;">{{ r.comment }}</p>
            </div>
          </div>

          <div *ngIf="loadingReviews" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-2" style="border-color:#e50914;border-top-color:transparent;"></div>
          </div>

          <button
            *ngIf="reviewPage + 1 < reviewTotalPages"
            (click)="loadMoreReviews()"
            class="mt-4 w-full py-2 rounded text-sm transition-colors"
            style="background:#1a1a1a;color:#888;border:1px solid #2a2a2a;"
          >Cargar más reseñas</button>
        </div>
      </div>
    </div>
  `,
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  reviews: Review[] = [];
  loading = true;
  loadingReviews = false;
  newComment = '';
  submitting = false;
  hoverRating = 0;
  hasVoted = false;
  reviewPage = 0;
  reviewTotalPages = 0;
  totalReviews = 0;

  get isLoggedIn(): boolean { return this.auth.isLoggedIn(); }

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private reviewService: ReviewService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.movieService.getById(id).subscribe({
      next: (m) => { this.movie = m; this.loading = false; },
      error: () => (this.loading = false),
    });
    this.loadReviews(id);
  }

  loadReviews(movieId: number, page = 0): void {
    this.loadingReviews = true;
    this.reviewService.getByMovie(movieId, page).subscribe({
      next: (p) => {
        this.reviews = page === 0 ? p.content : [...this.reviews, ...p.content];
        this.reviewTotalPages = p.totalPages;
        this.totalReviews = p.totalElements;
        this.reviewPage = page;
        this.loadingReviews = false;
      },
      error: () => (this.loadingReviews = false),
    });
  }

  loadMoreReviews(): void {
    if (this.movie) this.loadReviews(this.movie.id, this.reviewPage + 1);
  }

  vote(rating: number): void {
    if (!this.movie) return;
    this.movieService.vote(this.movie.id, rating).subscribe({
      next: (m) => { this.movie = m; this.hasVoted = true; },
    });
  }

  submitReview(): void {
    if (!this.movie || !this.newComment.trim()) return;
    this.submitting = true;
    this.reviewService.create(this.movie.id, { comment: this.newComment }).subscribe({
      next: (r) => {
        this.reviews = [r, ...this.reviews];
        this.totalReviews++;
        this.newComment = '';
        this.submitting = false;
      },
      error: () => (this.submitting = false),
    });
  }

  deleteReview(review: Review): void {
    if (!this.movie) return;
    this.reviewService.delete(this.movie.id, review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((r) => r.id !== review.id);
        this.totalReviews--;
      },
    });
  }

  canEditReview(review: Review): boolean {
    return this.auth.getUserId() === review.userId || this.auth.isAdmin();
  }
}
