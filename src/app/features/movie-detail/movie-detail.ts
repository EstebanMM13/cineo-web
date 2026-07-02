import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    .spinner { border:2px solid rgba(212,160,23,0.15); border-top-color:#D4A017; border-radius:50%; animation:spin 0.8s linear infinite; }
    .vote-btn { width:32px; height:32px; border-radius:7px; border:1px solid #1e1e1e; background:#0f0f0f; color:#555; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s; }
    .vote-btn:hover, .vote-btn.active { background:#D4A017; color:#080808; border-color:#D4A017; }
    .review-card { background:#0f0f0f; border:1px solid #1a1a1a; border-radius:12px; padding:16px; }
    .genre-tag { font-size:12px; padding:4px 10px; border-radius:6px; background:rgba(212,160,23,0.07); color:rgba(212,160,23,0.7); border:1px solid rgba(212,160,23,0.15); }
    .review-textarea { width:100%; padding:12px; background:#0a0a0a; border:1px solid #1e1e1e; border-radius:10px; color:#e8e8e8; font-size:13px; outline:none; resize:none; box-sizing:border-box; font-family:inherit; transition:border-color 0.2s; }
    .review-textarea:focus { border-color:rgba(212,160,23,0.4); }
    .submit-btn { padding:9px 20px; background:#D4A017; color:#080808; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:filter 0.2s; }
    .submit-btn:hover:not(:disabled) { filter:brightness(1.1); }
    .submit-btn:disabled { opacity:0.4; cursor:not-allowed; }
    .delete-btn { display:flex; align-items:center; gap:4px; font-size:12px; color:#3a3a3a; background:transparent; border:none; cursor:pointer; padding:4px 8px; border-radius:6px; transition:all 0.15s; }
    .delete-btn:hover { color:#e05555; background:rgba(224,85,85,0.08); }
    .load-more-btn { width:100%; padding:10px; background:transparent; border:1px solid #1e1e1e; border-radius:10px; color:#555; font-size:13px; cursor:pointer; margin-top:12px; transition:all 0.2s; }
    .load-more-btn:hover { border-color:#333; color:#e8e8e8; }
    .back-btn { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#555; text-decoration:none; padding:6px 0; transition:color 0.2s; }
    .back-btn:hover { color:#D4A017; }
  `],
  template: `
    <!-- Loading -->
    <div *ngIf="loading" style="display:flex;justify-content:center;padding:96px 0;">
      <div class="spinner" style="width:32px;height:32px;"></div>
    </div>

    <div *ngIf="movie && !loading">
      <!-- Hero backdrop -->
      <div style="position:relative;height:340px;overflow:hidden;background:#0a0a0a;">
        <img *ngIf="movie.imageUrl" [src]="movie.imageUrl" [alt]="movie.title"
          style="width:100%;height:100%;object-fit:cover;opacity:0.25;filter:blur(3px);transform:scale(1.05);" />
        <div style="position:absolute;inset:0;background:linear-gradient(to top,#080808 25%,rgba(8,8,8,0.5) 65%,rgba(8,8,8,0.15));"></div>
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
              <img *ngIf="movie.imageUrl" [src]="movie.imageUrl" [alt]="movie.title" style="width:100%;aspect-ratio:2/3;object-fit:cover;display:block;" />
              <div *ngIf="!movie.imageUrl" style="width:100%;aspect-ratio:2/3;background:#111;display:flex;align-items:center;justify-content:center;color:#222;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><rect x="2" y="2" width="20" height="20" rx="2"/></svg>
              </div>
            </div>
          </div>

          <!-- Details -->
          <div style="flex:1;padding-top:100px;">
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
              <span *ngFor="let g of movie.genres ?? []" class="genre-tag">{{ g.name }}</span>
            </div>
            <h1 style="font-size:28px;font-weight:700;color:#e8e8e8;margin:0 0 4px 0;line-height:1.2;">{{ movie.title }}</h1>
            <p style="font-size:13px;color:#3a3a3a;margin:0 0 16px 0;">{{ movie.movieYear }}</p>
            <p style="font-size:14px;line-height:1.7;color:#888;margin:0 0 20px 0;max-width:560px;">{{ movie.description }}</p>

            <!-- Rating + vote -->
            <div style="display:flex;align-items:center;flex-wrap:wrap;gap:16px;">
              <div style="display:flex;align-items:center;gap:8px;background:#0f0f0f;border:1px solid #1a1a1a;border-radius:10px;padding:10px 14px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#D4A017" stroke="#D4A017" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style="font-size:22px;font-weight:700;color:#e8e8e8;">{{ movie.rating | number:'1.1-1' }}</span>
                <span style="font-size:12px;color:#3a3a3a;">/10 · {{ movie.votes }} votos</span>
              </div>

              <div *ngIf="isLoggedIn && !hasVoted" style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:12px;color:#555;">Tu voto:</span>
                <div style="display:flex;gap:3px;">
                  <button
                    *ngFor="let n of voteNumbers"
                    class="vote-btn"
                    [class.active]="hoverRating >= n"
                    [attr.aria-label]="'Votar ' + n + ' sobre 10'"
                    (click)="vote(n)"
                    (mouseenter)="hoverRating = n"
                    (mouseleave)="hoverRating = 0"
                  >{{ n }}</button>
                </div>
              </div>

              <span *ngIf="hasVoted" style="font-size:13px;color:#D4A017;">✓ Voto registrado</span>
              <span *ngIf="!isLoggedIn" style="font-size:13px;color:#3a3a3a;">Inicia sesión para votar</span>
            </div>
          </div>
        </div>

        <!-- Reviews -->
        <div style="margin-top:48px;padding-top:32px;border-top:1px solid #1a1a1a;">
          <h2 style="font-size:18px;font-weight:600;color:#e8e8e8;margin:0 0 20px 0;">
            Reseñas
            <span style="font-size:14px;font-weight:400;color:#3a3a3a;margin-left:6px;">({{ totalReviews }})</span>
          </h2>

          <!-- Write review -->
          <div *ngIf="isLoggedIn" style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:12px;padding:16px;margin-bottom:20px;">
            <textarea
              [(ngModel)]="newComment"
              placeholder="Escribe tu reseña..."
              rows="3"
              class="review-textarea"
            ></textarea>
            <div style="display:flex;justify-content:flex-end;margin-top:10px;">
              <button (click)="submitReview()" class="submit-btn" [disabled]="!newComment.trim() || submitting">
                {{ submitting ? 'Publicando...' : 'Publicar reseña' }}
              </button>
            </div>
          </div>

          <!-- Empty -->
          <div *ngIf="reviews.length === 0 && !loadingReviews" style="font-size:13px;color:#3a3a3a;padding:16px 0;">
            Todavía no hay reseñas. ¡Sé el primero!
          </div>

          <!-- List -->
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div *ngFor="let r of reviews; trackBy: trackByReview" class="review-card">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:34px;height:34px;border-radius:50%;background:rgba(212,160,23,0.1);border:1px solid rgba(212,160,23,0.2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#D4A017;flex-shrink:0;">
                    {{ r.username.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div style="font-size:13px;font-weight:600;color:#e8e8e8;">{{ r.username }}</div>
                    <div style="font-size:11px;color:#3a3a3a;margin-top:1px;">{{ r.createdAt | date:'d MMM yyyy' }}</div>
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
          <div *ngIf="loadingReviews" style="display:flex;justify-content:center;padding:24px 0;">
            <div class="spinner" style="width:24px;height:24px;"></div>
          </div>

          <button *ngIf="reviewPage + 1 < reviewTotalPages" (click)="loadMoreReviews()" class="load-more-btn">
            Cargar más reseñas
          </button>
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
  isLoggedIn = false;
  voteNumbers = [1,2,3,4,5,6,7,8,9,10];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private reviewService: ReviewService,
    private auth: AuthService,
    private notifications: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.movieService.getById(id).subscribe({
      next: (m) => { this.movie = m; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
    });
    if (this.isLoggedIn) {
      this.movieService.getVoteStatus(id).subscribe({
        next: (voted) => { this.hasVoted = voted; this.cdr.detectChanges(); },
      });
    }
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
        this.cdr.detectChanges();
      },
      error: () => { this.loadingReviews = false; this.cdr.detectChanges(); },
    });
  }

  loadMoreReviews(): void {
    if (this.movie) this.loadReviews(this.movie.id, this.reviewPage + 1);
  }

  vote(rating: number): void {
    if (!this.movie) return;
    this.movieService.vote(this.movie.id, rating).subscribe({
      next: (m) => { this.movie = m; this.hasVoted = true; this.cdr.detectChanges(); },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.hasVoted = true;
          this.notifications.info('Ya has votado esta película.');
        } else {
          this.notifications.error('No se ha podido registrar tu voto.');
        }
        this.cdr.detectChanges();
      },
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
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.notifications.error(
          err.status === 409 ? 'Ya has escrito una reseña para esta película.' : 'No se ha podido publicar la reseña.'
        );
        this.cdr.detectChanges();
      },
    });
  }

  deleteReview(review: Review): void {
    if (!this.movie) return;
    this.reviewService.delete(this.movie.id, review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((r) => r.id !== review.id);
        this.totalReviews--;
        this.cdr.detectChanges();
      },
    });
  }

  canEditReview(review: Review): boolean {
    return this.auth.getUserId() === review.userId || this.auth.isAdmin();
  }

  trackByReview(_: number, r: Review): number { return r.id; }
}
