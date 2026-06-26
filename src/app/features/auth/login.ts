import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4" style="background:#0a0a0a;">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <span class="text-4xl" style="color:#e50914;">&#9654;</span>
          <h1 class="text-2xl font-bold text-white mt-2">CineAPI</h1>
          <p class="text-sm mt-1" style="color:#888;">Inicia sesión en tu cuenta</p>
        </div>

        <div class="p-6 rounded-xl" style="background:#1a1a1a;border:1px solid #2a2a2a;">
          <div *ngIf="error" class="mb-4 p-3 rounded text-sm" style="background:#3a1a1a;color:#ff6b6b;border:1px solid #e50914;">
            {{ error }}
          </div>

          <form (ngSubmit)="submit()" #form="ngForm">
            <div class="mb-4">
              <label class="block text-sm mb-1.5" style="color:#888;">Usuario</label>
              <input
                type="text"
                [(ngModel)]="username"
                name="username"
                required
                class="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                style="background:#111;border:1px solid #2a2a2a;"
                placeholder="tu_usuario"
              />
            </div>
            <div class="mb-6">
              <label class="block text-sm mb-1.5" style="color:#888;">Contraseña</label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                class="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                style="background:#111;border:1px solid #2a2a2a;"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              [disabled]="loading || !form.valid"
              class="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 transition-opacity"
              style="background:#e50914;color:#fff;"
            >{{ loading ? 'Entrando...' : 'Iniciar sesión' }}</button>
          </form>
        </div>

        <p class="text-center text-sm mt-4" style="color:#888;">
          ¿No tienes cuenta?
          <a routerLink="/register" style="color:#e50914;" class="hover:underline ml-1">Regístrate</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error = 'Usuario o contraseña incorrectos.';
        this.loading = false;
      },
    });
  }
}
