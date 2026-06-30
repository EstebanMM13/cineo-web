import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie } from '../../core/models/models';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .card { display:block; text-decoration:none; background:#0f0f0f; border:1px solid #1a1a1a; border-radius:12px; overflow:hidden; transition:transform 0.25s ease,box-shadow 0.25s ease,border-color 0.25s ease; cursor:pointer; }
    .card:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.6); border-color:rgba(212,160,23,0.2); }
    .card:hover .overlay { opacity:1; }
    .card:hover .poster { transform:scale(1.05); }
    .poster { width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease; display:block; }
    .overlay { position:absolute; inset:0; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity 0.25s ease; }
    .overlay-btn { background:#D4A017; color:#080808; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:8px 16px; border-radius:8px; }
    .genre-tag { font-size:11px; padding:2px 7px; border-radius:5px; background:rgba(212,160,23,0.07); color:rgba(212,160,23,0.55); border:1px solid rgba(212,160,23,0.12); }
  `],
  template: `
    <a class="card" [routerLink]="['/movies', movie.id]">
      <div style="position:relative;aspect-ratio:2/3;background:#111;overflow:hidden;">
        <img
          *ngIf="movie.imageUrl && !imgError; else placeholder"
          [src]="movie.imageUrl"
          [alt]="movie.title"
          loading="lazy"
          class="poster"
          (error)="imgError = true"
        />
        <ng-template #placeholder>
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#1e1e1e;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
        </ng-template>

        <!-- Bottom gradient -->
        <div style="position:absolute;bottom:0;left:0;right:0;height:50%;background:linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 100%);pointer-events:none;"></div>

        <!-- Rating -->
        <div style="position:absolute;top:8px;right:8px;display:flex;align-items:center;gap:4px;padding:4px 7px;border-radius:7px;background:rgba(0,0,0,0.8);backdrop-filter:blur(6px);">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="#D4A017" stroke="#D4A017" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span style="font-size:11px;font-weight:700;color:#D4A017;">{{ movie.rating | number:'1.1-1' }}</span>
        </div>

        <div class="overlay"><span class="overlay-btn">Ver detalles</span></div>
      </div>

      <!-- Info -->
      <div style="padding:12px;">
        <h3 style="font-size:13px;font-weight:600;color:#e8e8e8;margin:0 0 3px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ movie.title }}</h3>
        <p style="font-size:12px;color:#3a3a3a;margin:0 0 8px 0;">{{ movie.movieYear }}</p>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          <span *ngFor="let g of topGenres" class="genre-tag">{{ g.name }}</span>
        </div>
      </div>
    </a>
  `,
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;
  imgError = false;
  get topGenres() { return (this.movie.genres ?? []).slice(0, 2); }
}
