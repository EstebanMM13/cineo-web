import { Component, OnInit, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MovieService } from '../../core/services/movie.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Movie, Review } from '../../core/models/models';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    @keyframes spin { to { transform:rotate(360deg); } }
    .spinner { border:2px solid rgba(212,160,23,0.15); border-top-color:var(--color-cinema-gold); border-radius:50%; animation:spin 0.8s linear infinite; }
    .vote-btn { width:32px; height:32px; border-radius:7px; border:1px solid var(--color-cinema-border); background:var(--color-cinema-surface); color:#555; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s; }
    .vote-btn:hover, .vote-btn.active { background:var(--color-cinema-gold); color:var(--color-cinema-bg); border-color:var(--color-cinema-gold); }
    .review-card { background:var(--color-cinema-surface); border:1px solid #1a1a1a; border-radius:12px; padding:16px; }
    .genre-tag { font-size:12px; padding:4px 10px; border-radius:6px; background:rgba(212,160,23,0.07); color:rgba(212,160,23,0.7); border:1px solid rgba(212,160,23,0.15); }
    .review-textarea { width:100%; padding:12px; background:#0a0a0a; border:1px solid var(--color-cinema-border); border-radius:10px; color:var(--color-cinema-text); font-size:13px; outline:none; resize:none; box-sizing:border-box; font-family:inherit; transition:border-color 0.2s; }
    .review-textarea:focus { border-color:rgba(212,160,23,0.4); }
    .submit-btn { padding:9px 20px; background:var(--color-cinema-gold); color:var(--color-cinema-bg); border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:filter 0.2s; }
    .submit-btn:hover:not(:disabled) { filter:brightness(1.1); }
    .submit-btn:disabled { opacity:0.4; cursor:not-allowed; }
    .delete-btn { display:flex; align-items:center; gap:4px; font-size:12px; color:#3a3a3a; background:transparent; border:none; cursor:pointer; padding:4px 8px; border-radius:6px; transition:all 0.15s; }
    .delete-btn:hover { color:#e05555; background:rgba(224,85,85,0.08); }
    .load-more-btn { width:100%; padding:10px; background:transparent; border:1px solid var(--color-cinema-border); border-radius:10px; color:#555; font-size:13px; cursor:pointer; margin-top:12px; transition:all 0.2s; }
    .load-more-btn:hover { border-color:#333; color:var(--color-cinema-text); }
    .back-btn { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#555; text-decoration:none; padding:6px 0; transition:color 0.2s; }
    .back-btn:hover { color:var(--color-cinema-gold); }
  `],
  template: `
    <!-- Skeleton -->
    <div *ngIf="loading()">
      <div style="height:340px;background:#0a0a0a;"></div>
      <div style="max-width:960px;margin:0 auto;padding:0 24px;">
        <div style="padding:20px 0;"><div class="skeleton" style="height:13px;width:55px;border-radius:4px;"></div></div>
        <div style="display:flex;gap:28px;margin-top:-160px;position:relative;z-index:10;">
          <div style="flex-shrink:0;width:160px;">
            <div class="skeleton" style="aspect-ratio:2/3;border-radius:12px;"></div>
          </div>
          <div style="flex:1;padding-top:100px;">
            <div style="display:flex;gap:6px;margin-bottom:14px;">
              <div class="skeleton" style="height:22px;width:58px;border-radius:6px;"></div>
              <div class="skeleton" style="height:22px;width:76px;border-radius:6px;"></div>
            </div>
            <div class="skeleton" style="height:30px;width:65%;border-radius:6px;margin-bottom:10px;"></div>
            <div class="skeleton" style="height:13px;width:28%;border-radius:4px;margin-bottom:22px;"></div>
            <div class="skeleton" style="height:13px;width:100%;border-radius:4px;margin-bottom:7px;"></div>
            <div class="skeleton" style="height:13px;width:92%;border-radius:4px;margin-bottom:7px;"></div>
            <div class="skeleton" style="height:13px;width:78%;border-radius:4px;margin-bottom:24px;"></div>
            <div class="skeleton" style="height:52px;width:180px;border-radius:10px;"></div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="movie() as m">
      <!-- Hero backdrop -->
      <div style="position:relative;height:340px;overflow:hidden;background:#0a0a0a;">
        <img *ngIf="m.imageUrl" [src]="m.imageUrl" [alt]="m.title"
          style="width:100%;height:100%;object-fit:cover;opacity:0.25;filter:blur(3px);transform:scale(1.05);" />
        <div style="position:absolute;inset:0;background:linear-gradient(to top,var(--color-cinema-bg) 25%,rgba(8,8,8,0.5) 65%,rgba(8,8,8,0.15));"></div>
      </div>

      <!-- Content -->
      <div style="max-width:960px;margin:0 auto;padding:0 24px 64px;">

        <!-- Back -->
        <div style="padding:16px 0;">
          <a routerLink="/" class="back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Volver
          </a>
        </div>

        <!-- Main info card -->
        <div style="display:flex;gap:28px;margin-top:-160px;position:relative;z-index:10;">

          <!-- Poster -->
          <div style="flex-shrink:0;width:160px;">
            <div style="border-radius:12px;overflow:hidden;border:1px solid rgba(212,160,23,0.15);box-shadow:0 24px 48px rgba(0,0,0,0.7);">
              <img *ngIf="m.imageUrl" [src]="m.imageUrl" [alt]="m.title" style="width:100%;aspect-ratio:2/3;object-fit:cover;display:block;" />
              <div *ngIf="!m.imageUrl" style="width:100%;aspect-ratio:2/3;background:#111;display:flex;align-items:center;justify-content:center;color:#222;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><rect x="2" y="2" width="20" height="20" rx="2"/></svg>
              </div>
            </div>
          </div>

          <!-- Details -->
          <div style="flex:1;padding-top:100px;">
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
              <span *ngFor="let g of m.genres ?? []" class="genre-tag">{{ g.name }}</span>
            </div>
            <h1 style="font-size:28px;font-weight:700;color:var(--color-cinema-text);margin:0 0 4px 0;line-height:1.2;">{{ m.title }}</h1>
            <p style="font-size:13px;color:#3a3a3a;margin:0 0 16px 0;">{{ m.movieYear }}</p>
            <p style="font-size:14px;line-height:1.7;color:#888;margin:0 0 20px 0;max-width:560px;">{{ m.description }}</p>

            <!-- Rating + vote -->
            <div style="display:flex;align-items:center;flex-wrap:wrap;gap:16px;">
              <div style="display:flex;align-items:center;gap:8px;background:var(--color-cinema-surface);border:1px solid #1a1a1a;border-radius:10px;padding:10px 14px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" style="color:var(--color-cinema-gold);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style="font-size:22px;font-weight:700;color:var(--color-cinema-text);">{{ m.rating | number:'1.1-1' }}</span>
                <span style="font-size:12px;color:#3a3a3a;">/10 · {{ m.votes }} votos</span>
              </div>

              <div *ngIf="isLoggedIn() && !hasVoted()" style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:12px;color:#555;">Tu voto:</span>
                <div style="display:flex;gap:3px;">
                  <button
                    *ngFor="let n of voteNumbers"
                    class="vote-btn"
                    [class.active]="hoverRating() >= n"
                    [attr.aria-label]="'Votar ' + n + ' sobre 10'"
                    (click)="vote(n)"
                    (mouseenter)="hoverRating.set(n)"
                    (mouseleave)="hoverRating.set(0)"
                  >{{ n }}</button>
                </div>
              </div>

              <span *ngIf="hasVoted()" style="font-size:13px;color:var(--color-cinema-gold);">✓ Voto registrado</span>
              <span *ngIf="!isLoggedIn()" style="font-size:13px;color:#3a3a3a;">Inicia sesión para votar</span>
            </div>
          </div>
        </div>

        <!-- Reviews -->
        <div style="margin-top:48px;padding-top:32px;border-top:1px solid #1a1a1a;">
          <h2 style="font-size:18px;font-weight:600;color:var(--color-cinema-text);margin:0 0 20px 0;">
            Reseñas
            <span style="font-size:14px;font-weight:400;color:#3a3a3a;margin-left:6px;">({{ totalReviews() }})</span>
          </h2>

          <!-- Write review -->
          <div *ngIf="isLoggedIn()" style="background:var(--color-cinema-surface);border:1px solid #1a1a1a;border-radius:12px;padding:16px;margin-bottom:20px;">
            <textarea
              [ngModel]="newComment()"
              (ngModelChange)="newComment.set($event)"
              placeholder="Escribe tu reseña..."
              rows="3"
              class="review-textarea"
            ></textarea>
            <div style="display:flex;justify-content:flex-end;margin-top:10px;">
              <button (click)="submitReview()" class="submit-btn" [disabled]="!newComment().trim() || submitting()">
                {{ submitting() ? 'Publicando...' : 'Publicar reseña' }}
              </button>
            </div>
          </div>

          <!-- Empty -->
          <div *ngIf="reviews().length === 0 && !loadingReviews()" style="font-size:13px;color:#3a3a3a;padding:16px 0;">
            Todavía no hay reseñas. ¡Sé el primero!
          </div>

          <!-- List -->
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div *ngFor="let r of reviews(); trackBy: trackByReview" class="review-card">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:34px;height:34px;border-radius:50%;background:rgba(212,160,23,0.1);border:1px solid rgba(212,160,23,0.2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--color-cinema-gold);flex-shrink:0;">
                    {{ r.username.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div style="font-size:13px;font-weight:600;color:var(--color-cinema-text);">{{ r.username }}</div>
                    <div style="font-size:11px;color:#3a3a3a;margin-top:1px;">{{ formatDate(r.createdAt) }}</div>
                  </div>
                </div>
                <button *ngIf="canEditReview(r)" (click)="deleteReview(r)" class="delete-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  Eliminar
                </button>
              </div>
              <p style="font-size:13px;line-height:1.6;color:#888;margin:0;">{{ r.comment }}</p>
            </div>
          </div>

          <!-- Loading reviews -->
          <div *ngIf="loadingReviews()" style="display:flex;justify-content:center;padding:24px 0;">
            <div class="spinner" style="width:24px;height:24px;"></div>
          </div>

          <button *ngIf="reviewPage() + 1 < reviewTotalPages()" (click)="loadMoreReviews()" class="load-more-btn">
            Cargar más reseñas
          </button>
        </div>
      </div>
    </div>
  `,
})
export class MovieDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly movieService = inject(MovieService);
  private readonly reviewService = inject(ReviewService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly movie = signal<Movie | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly loading = signal(true);
  readonly loadingReviews = signal(false);
  readonly newComment = signal('');
  readonly submitting = signal(false);
  readonly hoverRating = signal(0);
  readonly hasVoted = signal(false);
  readonly reviewPage = signal(0);
  readonly reviewTotalPages = signal(0);
  readonly totalReviews = signal(0);
  readonly isLoggedIn = toSignal(this.auth.isLoggedIn$(), { initialValue: this.auth.isLoggedIn() });
  readonly voteNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.movieService.getById(id).subscribe({
      next: (m) => { this.movie.set(m); this.loading.set(false); },
      error: () => this.loading.set(false),
    });

    if (this.isLoggedIn()) {
      this.movieService.getVoteStatus(id).subscribe({
        next: (voted) => this.hasVoted.set(voted),
      });
    }

    this.loadReviews(id);
  }

  loadReviews(movieId: number, page = 0): void {
    this.loadingReviews.set(true);
    this.reviewService.getByMovie(movieId, page).subscribe({
      next: (p) => {
        this.reviews.set(page === 0 ? p.content : [...this.reviews(), ...p.content]);
        this.reviewTotalPages.set(p.totalPages);
        this.totalReviews.set(p.totalElements);
        this.reviewPage.set(page);
        this.loadingReviews.set(false);
      },
      error: () => this.loadingReviews.set(false),
    });
  }

  loadMoreReviews(): void {
    const m = this.movie();
    if (m) this.loadReviews(m.id, this.reviewPage() + 1);
  }

  vote(rating: number): void {
    const m = this.movie();
    if (!m) return;
    this.movieService.vote(m.id, rating).subscribe({
      next: (updated) => { this.movie.set(updated); this.hasVoted.set(true); },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.hasVoted.set(true);
          this.notifications.info('Ya has votado esta película.');
        } else {
          this.notifications.error('No se ha podido registrar tu voto.');
        }
      },
    });
  }

  submitReview(): void {
    const m = this.movie();
    const comment = this.newComment().trim();
    if (!m || !comment) return;
    this.submitting.set(true);
    this.reviewService.create(m.id, { comment }).subscribe({
      next: (r) => {
        this.reviews.update((prev) => [r, ...prev]);
        this.totalReviews.update((n) => n + 1);
        this.newComment.set('');
        this.submitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.notifications.error(
          err.status === 409 ? 'Ya has escrito una reseña para esta película.' : 'No se ha podido publicar la reseña.'
        );
      },
    });
  }

  deleteReview(review: Review): void {
    const m = this.movie();
    if (!m) return;
    this.reviewService.delete(m.id, review.id).subscribe({
      next: () => {
        this.reviews.update((prev) => prev.filter((r) => r.id !== review.id));
        this.totalReviews.update((n) => n - 1);
      },
    });
  }

  canEditReview(review: Review): boolean {
    return this.auth.getUserId() === review.userId || this.auth.isAdmin();
  }

  trackByReview(_: number, r: Review): number { return r.id; }

  formatDate(raw: string): string {
    const date = new Date(raw);
    return isNaN(date.getTime()) ? raw : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
