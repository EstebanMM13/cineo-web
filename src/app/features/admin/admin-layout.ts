import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-white mb-6">Panel de administración</h1>
      <div class="flex gap-2 mb-8 border-b" style="border-color:#2a2a2a;">
        <a routerLink="movies" routerLinkActive="border-b-2 text-white"
           class="pb-3 px-1 text-sm transition-colors"
           style="border-color:#e50914;color:#888;">Películas</a>
        <a routerLink="genres" routerLinkActive="border-b-2 text-white"
           class="pb-3 px-1 text-sm transition-colors"
           style="border-color:#e50914;color:#888;">Géneros</a>
        <a routerLink="users" routerLinkActive="border-b-2 text-white"
           class="pb-3 px-1 text-sm transition-colors"
           style="border-color:#e50914;color:#888;">Usuarios</a>
      </div>
      <router-outlet />
    </div>
  `,
})
export class AdminLayoutComponent {}
