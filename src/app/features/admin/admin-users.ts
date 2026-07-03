import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { User, SystemStats } from '../../core/models/models';
import { PaginationComponent } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div>
      <div *ngIf="stats" class="grid grid-cols-3 gap-4 mb-8">
        <div class="p-5 rounded-lg text-center" style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:2px solid #e5e5e5;">
          <p class="text-3xl font-bold text-white">{{ stats.totalUsers }}</p>
          <p class="text-xs mt-2 uppercase tracking-widest" style="color:#666;">Total usuarios</p>
        </div>
        <div class="p-5 rounded-lg text-center" style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:2px solid var(--color-cinema-gold);">
          <p class="text-3xl font-bold" style="color:var(--color-cinema-gold);">{{ stats.adminUsers }}</p>
          <p class="text-xs mt-2 uppercase tracking-widest" style="color:#666;">Administradores</p>
        </div>
        <div class="p-5 rounded-lg text-center" style="background:#1a1a1a;border:1px solid #2a2a2a;border-top:2px solid #4a9;">
          <p class="text-3xl font-bold" style="color:#4a9;">{{ stats.regularUsers }}</p>
          <p class="text-xs mt-2 uppercase tracking-widest" style="color:#666;">Usuarios regulares</p>
        </div>
      </div>

      <div *ngIf="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2" style="border-color:var(--color-cinema-gold);border-top-color:transparent;"></div>
      </div>

      <div *ngIf="!loading" class="rounded-lg overflow-hidden" style="border:1px solid #2a2a2a;">
        <table class="w-full text-sm">
          <thead style="background:#1a1a1a;">
            <tr>
              <th class="text-left px-4 py-3 font-medium" style="color:#888;">ID</th>
              <th class="text-left px-4 py-3 font-medium" style="color:#888;">Usuario</th>
              <th class="text-left px-4 py-3 font-medium" style="color:#888;">Email</th>
              <th class="text-left px-4 py-3 font-medium" style="color:#888;">Rol</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users" class="transition-colors hover:bg-[#1f1f1f]" style="border-top:1px solid #2a2a2a;">
              <td class="px-4 py-3" style="color:#888;">{{ u.id }}</td>
              <td class="px-4 py-3 text-white">{{ u.username }}</td>
              <td class="px-4 py-3" style="color:#888;">{{ u.email }}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded font-medium"
                  [style]="u.role === 'ADMIN' ? 'background:rgba(212,160,23,0.1);color:var(--color-cinema-gold);' : 'background:#1a2a1a;color:#4a9;'">
                  {{ u.role }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button *ngIf="u.role !== 'ADMIN'" (click)="remove(u)" class="text-xs px-2 py-1 rounded" style="background:#3a1a1a;color:#ff6b6b;">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-pagination [currentPage]="page" [totalPages]="totalPages" (pageChange)="onPage($event)" />
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  stats: SystemStats | null = null;
  loading = false;
  page = 0;
  totalPages = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
    this.adminService.getStats().subscribe((s) => (this.stats = s));
  }

  load(): void {
    this.loading = true;
    this.adminService.getUsers(this.page).subscribe({
      next: (p) => { this.users = p.content; this.totalPages = p.totalPages; this.loading = false; },
      error: () => (this.loading = false),
    });
  }

  remove(u: User): void {
    if (!confirm(`¿Eliminar usuario "${u.username}"?`)) return;
    this.adminService.deleteUser(u.id).subscribe(() => this.load());
  }

  onPage(p: number): void { this.page = p; this.load(); }
}
