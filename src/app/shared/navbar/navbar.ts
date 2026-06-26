import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <nav class="sticky top-0 z-50 border-b" style="background:#0a0a0a;border-color:#2a2a2a;">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">

        <a routerLink="/" class="flex items-center gap-2 shrink-0">
          <span class="text-xl font-bold" style="color:#e50914;">&#9654;</span>
          <span class="text-lg font-bold text-white tracking-tight">CineAPI</span>
        </a>

        <div class="flex-1 max-w-md">
          <div class="relative">
            <input
              type="text"
              placeholder="Buscar películas..."
              [(ngModel)]="searchQuery"
              (keyup.enter)="search()"
              class="w-full px-4 py-2 rounded-lg text-sm text-white outline-none"
              style="background:#1a1a1a;border:1px solid #2a2a2a;"
            />
            <button (click)="search()" class="absolute right-3 top-2.5" style="color:#888;">
              &#128269;
            </button>
          </div>
        </div>

        <div class="ml-auto flex items-center gap-4">
          <ng-container *ngIf="isLoggedIn; else guestLinks">
            <span *ngIf="isAdmin" class="text-xs font-semibold px-2 py-1 rounded" style="background:#e50914;color:#fff;">ADMIN</span>
            <a *ngIf="isAdmin" routerLink="/admin" class="text-sm hover:text-white transition-colors" style="color:#888;">Panel admin</a>
            <span class="text-sm" style="color:#888;">{{ username }}</span>
            <button (click)="logout()" class="text-sm px-3 py-1.5 rounded border transition-colors hover:text-white" style="color:#888;border-color:#2a2a2a;">
              Salir
            </button>
          </ng-container>
          <ng-template #guestLinks>
            <a routerLink="/login" class="text-sm transition-colors hover:text-white" style="color:#888;">Iniciar sesión</a>
            <a routerLink="/register" class="text-sm px-3 py-1.5 rounded font-medium transition-colors" style="background:#e50914;color:#fff;">Registrarse</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;
  searchQuery = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.isLoggedIn$().subscribe((v) => {
      this.isLoggedIn = v;
      this.isAdmin = this.auth.isAdmin();
      this.username = this.auth.getUsername();
    });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
