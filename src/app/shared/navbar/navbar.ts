import { Component, HostListener, ElementRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, catchError, map, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { GenreService } from '../../core/services/genre.service';
import { Genre } from '../../core/models/models';

interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string | null;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styles: [`
    .nav-input { background:var(--color-cinema-surface); border:1px solid var(--color-cinema-border); outline:none; color:var(--color-cinema-text); border-radius:10px; padding:8px 12px 8px 38px; font-size:13px; width:100%; transition:border-color 0.2s; }
    .nav-input:focus { border-color:rgba(212,160,23,0.4); }
    .genre-item { display:block; width:100%; text-align:left; padding:9px 16px; font-size:13px; background:transparent; border:none; cursor:pointer; transition:background 0.15s,color 0.15s; color:#666; }
    .genre-item:hover { color:var(--color-cinema-text); background:rgba(255,255,255,0.04); }
    .genre-item.active { color:var(--color-cinema-gold); background:rgba(212,160,23,0.07); }
    .nav-btn { background:transparent; border:1px solid var(--color-cinema-border); color:#666; border-radius:8px; padding:7px 12px; font-size:13px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s; }
    .nav-btn:hover { color:var(--color-cinema-text); border-color:#333; }
    .nav-btn.active { color:var(--color-cinema-gold); border-color:rgba(212,160,23,0.3); background:rgba(212,160,23,0.07); }
    .search-btn { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:rgba(212,160,23,0.12); border:none; border-radius:6px; padding:5px 8px; cursor:pointer; display:flex; align-items:center; transition:background 0.2s; }
    .search-btn:hover { background:rgba(212,160,23,0.22); }
  `],
  template: `
    <nav style="background:var(--color-cinema-bg);border-bottom:1px solid rgba(212,160,23,0.1);position:sticky;top:0;z-index:50;">
      <div style="max-width:1280px;margin:0 auto;padding:0 24px;height:68px;display:flex;align-items:center;gap:16px;">

        <!-- Logo -->
        <a routerLink="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;">
          <img src="cineo-mark.svg" width="26" height="26" alt="Cineo">
          <span style="font-size:16px;font-weight:700;letter-spacing:-0.3px;">
            <span style="color:#fff;">Cin</span><span style="color:var(--color-cinema-gold);">eo</span>
          </span>
        </a>

        <!-- Search -->
        <div style="flex:1;max-width:420px;position:relative;">
          <svg style="position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar películas..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            (keyup.enter)="search()"
            class="nav-input"
            style="padding-right:40px;"
          />
          <button (click)="search()" class="search-btn" aria-label="Buscar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-cinema-gold);">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        <!-- Spacer -->
        <div style="flex:1;"></div>

        <!-- Genre dropdown -->
        <div style="position:relative;">
          <button class="nav-btn" [class.active]="genreOpen() || activeGenre()" (click)="toggleGenres($event)" aria-haspopup="true" [attr.aria-expanded]="genreOpen()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            {{ activeGenre() || 'Géneros' }}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" [style.transform]="genreOpen() ? 'rotate(180deg)' : 'rotate(0)'" style="transition:transform 0.2s;">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <div *ngIf="genreOpen()" style="position:absolute;right:0;top:calc(100% + 8px);background:var(--color-cinema-surface);border:1px solid rgba(212,160,23,0.15);border-radius:12px;box-shadow:0 24px 48px rgba(0,0,0,0.8);min-width:200px;z-index:100;overflow:hidden;padding:6px 0;">
            <button class="genre-item" [class.active]="!activeGenre()" (click)="selectGenre(null)">Todos los géneros</button>
            <div style="height:1px;background:rgba(255,255,255,0.05);margin:4px 0;"></div>
            <button *ngFor="let g of genres$ | async" class="genre-item" [class.active]="activeGenre() === g.name" (click)="selectGenre(g.name)">{{ g.name }}</button>
          </div>
        </div>

        <!-- Auth -->
        <ng-container *ngIf="authState$ | async as auth">
          <ng-container *ngIf="auth.isLoggedIn; else guestLinks">
            <span *ngIf="auth.isAdmin" style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;background:rgba(212,160,23,0.1);color:var(--color-cinema-gold);border:1px solid rgba(212,160,23,0.25);">ADMIN</span>
            <a *ngIf="auth.isAdmin" routerLink="/admin" style="font-size:13px;color:#555;text-decoration:none;">Panel</a>
            <span style="font-size:13px;color:#555;">{{ auth.username }}</span>
            <button (click)="logout()" class="nav-btn">Salir</button>
          </ng-container>
          <ng-template #guestLinks>
            <a routerLink="/login" style="font-size:13px;color:#666;text-decoration:none;">Iniciar sesión</a>
            <a routerLink="/register" style="font-size:13px;font-weight:600;padding:8px 16px;border-radius:8px;background:var(--color-cinema-gold);color:var(--color-cinema-bg);text-decoration:none;">Registrarse</a>
          </ng-template>
        </ng-container>

      </div>
    </nav>
  `,
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly genreService = inject(GenreService);
  private readonly el = inject(ElementRef);

  readonly authState$: Observable<AuthState>;
  readonly genres$: Observable<Genre[]>;

  readonly searchQuery = signal('');
  readonly activeGenre = signal<string | null>(null);
  readonly genreOpen = signal(false);

  constructor() {
    this.authState$ = this.auth.isLoggedIn$().pipe(
      map((isLoggedIn): AuthState => ({
        isLoggedIn,
        isAdmin: isLoggedIn ? this.auth.isAdmin() : false,
        username: isLoggedIn ? this.auth.getUsername() : null,
      }))
    );

    this.genres$ = this.genreService.getAll().pipe(
      map((page) => page.content),
      catchError(() => of([] as Genre[]))
    );

    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.searchQuery.set(params['q'] ?? '');
      this.activeGenre.set(params['genre'] ?? null);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.genreOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.genreOpen.set(false);
  }

  toggleGenres(event: MouseEvent): void {
    event.stopPropagation();
    this.genreOpen.update((open) => !open);
  }

  selectGenre(name: string | null): void {
    this.genreOpen.set(false);
    this.router.navigate(['/'], { queryParams: name ? { genre: name } : {} });
  }

  search(): void {
    const q = this.searchQuery().trim();
    if (q) this.router.navigate(['/'], { queryParams: { q } });
  }

  logout(): void { this.auth.logout(); }
}
