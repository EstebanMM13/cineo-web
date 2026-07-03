import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  styles: [`
    .nav-link {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 8px; font-size: 13px; font-weight: 500;
      color: #555; text-decoration: none; transition: all 0.15s; cursor: pointer;
    }
    .nav-link:hover { color: #aaa; background: rgba(255,255,255,0.03); }
    .nav-link.active { color: var(--color-cinema-gold); background: rgba(212,160,23,0.08); }
    .nav-link .icon { opacity: 0.5; transition: opacity 0.15s; flex-shrink: 0; }
    .nav-link.active .icon { opacity: 1; }
    .back-link {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: #333; text-decoration: none; padding: 8px 12px;
      border-radius: 8px; transition: color 0.15s;
    }
    .back-link:hover { color: #777; }
  `],
  template: `
    <div style="display:flex;min-height:calc(100vh - 68px);">

      <!-- Sidebar -->
      <aside style="width:216px;flex-shrink:0;background:#050505;border-right:1px solid #141414;display:flex;flex-direction:column;padding:20px 12px;position:sticky;top:68px;height:calc(100vh - 68px);overflow-y:auto;">

        <div style="padding:4px 12px 20px;margin-bottom:8px;border-bottom:1px solid #141414;">
          <p style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#2a2a2a;margin:0;">Panel de control</p>
        </div>

        <nav style="display:flex;flex-direction:column;gap:2px;flex:1;">

          <a routerLink="movies" routerLinkActive="active" class="nav-link">
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            Películas
          </a>

          <a routerLink="genres" routerLinkActive="active" class="nav-link">
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            Géneros
          </a>

          <a routerLink="users" routerLinkActive="active" class="nav-link">
            <svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Usuarios
          </a>

        </nav>

        <!-- Back to site -->
        <a routerLink="/" class="back-link">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Volver al sitio
        </a>
      </aside>

      <!-- Main content -->
      <main style="flex:1;padding:36px 40px;overflow:auto;min-width:0;">
        <router-outlet />
      </main>

    </div>
  `,
})
export class AdminLayoutComponent {}
