import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

const FILM_BG = `background-color:#080808;background-image:url("data:image/svg+xml,%3Csvg width='60' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='10' width='10' height='14' rx='2' fill='%23D4A017' fill-opacity='0.055'/%3E%3Crect x='46' y='10' width='10' height='14' rx='2' fill='%23D4A017' fill-opacity='0.055'/%3E%3C/svg%3E");background-size:60px 40px;`;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .auth-input { width:100%; padding:12px 16px; background:#0a0a0a; border:1px solid #1e1e1e; border-radius:10px; color:#e8e8e8; font-size:13px; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
    .auth-input:focus { border-color:rgba(212,160,23,0.45); }
    .auth-btn { width:100%; padding:13px; background:#D4A017; color:#080808; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; transition:filter 0.2s,transform 0.1s; display:flex; align-items:center; justify-content:center; gap:8px; }
    .auth-btn:hover:not(:disabled) { filter:brightness(1.1); }
    .auth-btn:active:not(:disabled) { transform:scale(0.98); }
    .auth-btn:disabled { opacity:0.4; cursor:not-allowed; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .spin { animation:spin 0.8s linear infinite; }
  `],
  template: `
    <div [style]="bg" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;">
      <div style="width:100%;max-width:380px;">

        <!-- Logo -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.18);margin-bottom:16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A017" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2"/>
              <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
              <line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
            </svg>
          </div>
          <div style="font-size:24px;font-weight:700;margin-bottom:6px;">
            <span style="color:#e8e8e8;">Cine</span><span style="color:#D4A017;">API</span>
          </div>
          <div style="font-size:13px;color:#444;">Tu universo cinematográfico</div>
        </div>

        <!-- Card -->
        <div style="background:#0f0f0f;border:1px solid rgba(212,160,23,0.12);border-radius:20px;padding:28px;box-shadow:0 32px 64px rgba(0,0,0,0.7);">
          <h2 style="color:#e8e8e8;font-size:18px;font-weight:600;margin:0 0 20px 0;">Crear cuenta</h2>

          <div *ngIf="error" style="background:rgba(212,160,23,0.07);color:#D4A017;border:1px solid rgba(212,160,23,0.2);border-radius:10px;padding:12px 14px;font-size:13px;margin-bottom:20px;">
            {{ error }}
          </div>

          <form (ngSubmit)="submit()" #form="ngForm">
            <div style="margin-bottom:14px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Usuario</label>
              <input class="auth-input" type="text" [(ngModel)]="username" name="username" required minlength="3" maxlength="20" autocomplete="username" placeholder="tu_usuario" />
            </div>
            <div style="margin-bottom:14px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Email</label>
              <input class="auth-input" type="email" [(ngModel)]="email" name="email" required autocomplete="email" placeholder="tu@email.com" />
            </div>
            <div style="margin-bottom:22px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Contraseña</label>
              <input class="auth-input" type="password" [(ngModel)]="password" name="password" required minlength="6" autocomplete="new-password" placeholder="Mínimo 6 caracteres" />
            </div>
            <button type="submit" class="auth-btn" [disabled]="loading || !form.valid">
              <svg *ngIf="loading" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ loading ? 'Registrando...' : 'Crear cuenta' }}
            </button>
          </form>
        </div>

        <p style="text-align:center;font-size:13px;color:#444;margin-top:20px;">
          ¿Ya tienes cuenta?
          <a routerLink="/login" style="color:#D4A017;text-decoration:none;font-weight:500;margin-left:4px;">Inicia sesión</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  loading = false;
  error = '';
  bg = FILM_BG;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        this.error = err.status === 409 ? 'El usuario o email ya existe.' : 'Error al registrarse.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
