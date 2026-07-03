import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notification.service';
import { User, SystemStats } from '../../core/models/models';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  styles: [`
    .stat-card {
      background: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 12px;
      padding: 20px; display: flex; align-items: center; gap: 16px;
    }
    .stat-icon {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .avatar {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; flex-shrink: 0;
    }
    .role-badge {
      display: inline-block; font-size: 10px; font-weight: 700;
      padding: 3px 8px; border-radius: 5px; letter-spacing: 0.5px; text-transform: uppercase;
    }
    .btn-del {
      padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 500;
      background: rgba(255,80,80,0.07); color: #ff6b6b;
      border: 1px solid rgba(255,80,80,0.13); cursor: pointer; transition: all 0.15s;
    }
    .btn-del:hover { background: rgba(255,80,80,0.15); }
    .tbl-row { border-bottom: 1px solid #141414; transition: background 0.12s; }
    .tbl-row:hover td { background: rgba(255,255,255,0.012); }
    .confirm-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      backdrop-filter: blur(6px); z-index: 200;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .confirm-card {
      background: #0f0f0f; border: 1px solid #222; border-radius: 14px;
      padding: 28px; max-width: 380px; width: 100%;
      box-shadow: 0 40px 80px rgba(0,0,0,0.8);
    }
  `],
  template: `
    <div style="margin-bottom:28px;">
      <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 4px;">Usuarios</h1>
      <p style="font-size:13px;color:#3a3a3a;margin:0;">Gestión de cuentas y estadísticas del sistema</p>
    </div>

    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px;" *ngIf="stats()">
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(255,255,255,0.03);border:1px solid #1e1e1e;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <p style="font-size:28px;font-weight:800;color:#fff;margin:0;line-height:1;">{{ stats()!.totalUsers }}</p>
          <p style="font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;margin:5px 0 0;">Total usuarios</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(212,160,23,0.06);border:1px solid rgba(212,160,23,0.12);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-cinema-gold)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <p style="font-size:28px;font-weight:800;color:var(--color-cinema-gold);margin:0;line-height:1;">{{ stats()!.adminUsers }}</p>
          <p style="font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;margin:5px 0 0;">Administradores</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(74,170,102,0.06);border:1px solid rgba(74,170,102,0.12);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <p style="font-size:28px;font-weight:800;color:#4a9;margin:0;line-height:1;">{{ stats()!.regularUsers }}</p>
          <p style="font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;margin:5px 0 0;">Usuarios regulares</p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div style="border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">
      <div *ngIf="loading()">
        <div *ngFor="let i of skeletonRows" style="display:flex;align-items:center;gap:14px;padding:13px 20px;border-bottom:1px solid #141414;">
          <div style="width:32px;height:32px;border-radius:8px;background:#141414;flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="height:12px;width:110px;background:#141414;border-radius:4px;margin-bottom:5px;"></div>
            <div style="height:10px;width:170px;background:#111;border-radius:4px;"></div>
          </div>
          <div style="height:20px;width:50px;background:#111;border-radius:5px;"></div>
        </div>
      </div>

      <table *ngIf="!loading()" style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#0a0a0a;border-bottom:1px solid #1a1a1a;">
            <th style="text-align:left;padding:12px 20px;font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;">Usuario</th>
            <th style="text-align:left;padding:12px 20px;font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;">Email</th>
            <th style="text-align:left;padding:12px 20px;font-size:10px;font-weight:700;color:#2a2a2a;text-transform:uppercase;letter-spacing:1px;">Rol</th>
            <th style="padding:12px 20px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users()" class="tbl-row">
            <td style="padding:12px 20px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <div class="avatar"
                  [style]="u.role === 'ADMIN'
                    ? 'background:rgba(212,160,23,0.1);color:var(--color-cinema-gold);'
                    : 'background:rgba(255,255,255,0.04);color:#444;'">
                  {{ u.username.charAt(0).toUpperCase() }}
                </div>
                <span style="font-size:13px;font-weight:500;color:#ccc;">{{ u.username }}</span>
              </div>
            </td>
            <td style="padding:12px 20px;font-size:13px;color:#3a3a3a;">{{ u.email }}</td>
            <td style="padding:12px 20px;">
              <span class="role-badge"
                [style]="u.role === 'ADMIN'
                  ? 'background:rgba(212,160,23,0.08);color:var(--color-cinema-gold);border:1px solid rgba(212,160,23,0.18);'
                  : 'background:rgba(74,170,102,0.07);color:#4a9;border:1px solid rgba(74,170,102,0.14);'">
                {{ u.role }}
              </span>
            </td>
            <td style="padding:12px 20px;text-align:right;">
              <button *ngIf="u.role !== 'ADMIN'" (click)="askDelete(u)" class="btn-del">Eliminar</button>
            </td>
          </tr>
          <tr *ngIf="users().length === 0">
            <td colspan="4" style="padding:56px;text-align:center;color:#2a2a2a;font-size:13px;">No hay usuarios.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-pagination [currentPage]="page" [totalPages]="totalPages()" (pageChange)="onPage($event)" />

    <!-- Delete confirm -->
    <div *ngIf="toDelete()" class="confirm-overlay" (click)="toDelete.set(null)">
      <div class="confirm-card" (click)="$event.stopPropagation()">
        <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 style="font-size:15px;font-weight:700;color:#fff;margin:0 0 8px;">Eliminar usuario</h3>
        <p style="font-size:13px;color:#555;margin:0 0 20px;line-height:1.6;">
          ¿Estás seguro de que quieres eliminar la cuenta de
          <strong style="color:#888;font-weight:600;">"{{ toDelete()?.username }}"</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button (click)="toDelete.set(null)" style="padding:9px 16px;border-radius:8px;font-size:13px;background:#141414;color:#666;border:1px solid #1e1e1e;cursor:pointer;">Cancelar</button>
          <button (click)="confirmDelete()" style="padding:9px 20px;border-radius:8px;font-size:13px;font-weight:600;background:rgba(255,80,80,0.12);color:#ff6b6b;border:1px solid rgba(255,80,80,0.2);cursor:pointer;">Eliminar</button>
        </div>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  readonly users = signal<User[]>([]);
  readonly stats = signal<SystemStats | null>(null);
  readonly loading = signal(false);
  readonly totalPages = signal(0);
  readonly toDelete = signal<User | null>(null);
  readonly skeletonRows = Array(6).fill(0);

  page = 0;

  constructor(private adminService: AdminService, private notify: NotificationService) {}

  ngOnInit(): void {
    this.load();
    this.adminService.getStats().subscribe((s) => this.stats.set(s));
  }

  load(): void {
    this.loading.set(true);
    this.adminService.getUsers(this.page).subscribe({
      next: (p) => {
        this.users.set(p.content);
        this.totalPages.set(p.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  askDelete(u: User): void { this.toDelete.set(u); }

  confirmDelete(): void {
    const target = this.toDelete();
    if (!target) return;
    const username = target.username;
    this.adminService.deleteUser(target.id).subscribe({
      next: () => {
        this.notify.success(`Usuario "${username}" eliminado.`);
        this.toDelete.set(null);
        this.load();
      },
      error: () => this.toDelete.set(null),
    });
  }

  onPage(p: number): void { this.page = p; this.load(); }
}
