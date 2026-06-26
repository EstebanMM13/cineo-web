import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie } from '../../core/models/models';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/movies', movie.id]" class="block group cursor-pointer rounded-lg overflow-hidden transition-transform hover:-translate-y-1" style="background:#1a1a1a;border:1px solid #2a2a2a;">
      <div class="relative aspect-[2/3] overflow-hidden" style="background:#111;">
        <img
          *ngIf="movie.imageUrl; else placeholder"
          [src]="movie.imageUrl"
          [alt]="movie.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          (error)="imgError = true"
        />
        <ng-template #placeholder>
          <div class="w-full h-full flex items-center justify-center text-4xl" style="color:#333;">&#127916;</div>
        </ng-template>
        <div class="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold" style="background:rgba(0,0,0,0.85);color:#f5c518;">
          &#9733; {{ movie.rating | number:'1.1-1' }}
        </div>
      </div>
      <div class="p-3">
        <h3 class="font-semibold text-sm text-white truncate leading-tight">{{ movie.title }}</h3>
        <p class="text-xs mt-0.5" style="color:#888;">{{ movie.movieYear }}</p>
        <div class="flex flex-wrap gap-1 mt-2">
          <span *ngFor="let g of movie.genres.slice(0,2)" class="text-xs px-1.5 py-0.5 rounded" style="background:#2a2a2a;color:#aaa;">
            {{ g.name }}
          </span>
        </div>
      </div>
    </a>
  `,
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: Movie;
  imgError = false;
}
