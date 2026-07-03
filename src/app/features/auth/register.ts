import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

const FILM_BG = `background-color:var(--color-cinema-bg);background-image:url("data:image/svg+xml,%3Csvg width='60' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='4' y='10' width='10' height='14' rx='2' fill='%23D4A017' fill-opacity='0.055'/%3E%3Crect x='46' y='10' width='10' height='14' rx='2' fill='%23D4A017' fill-opacity='0.055'/%3E%3C/svg%3E");background-size:60px 40px;`;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styles: [`
    .auth-input { width:100%; padding:12px 16px; background:#0a0a0a; border:1px solid var(--color-cinema-border); border-radius:10px; color:var(--color-cinema-text); font-size:13px; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
    .auth-input:focus { border-color:rgba(212,160,23,0.45); }
    .auth-input.ng-invalid.ng-touched { border-color:rgba(224,85,85,0.5); }
    .field-error { display:block; font-size:11px; color:#e05555; margin-top:5px; }
    .auth-btn { width:100%; padding:13px; background:var(--color-cinema-gold); color:var(--color-cinema-bg); border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; transition:filter 0.2s,transform 0.1s; display:flex; align-items:center; justify-content:center; gap:8px; }
    .auth-btn:hover:not(:disabled) { filter:brightness(1.1); }
    .auth-btn:active:not(:disabled) { transform:scale(0.98); }
    .auth-btn:disabled { opacity:0.4; cursor:not-allowed; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .spin { animation:spin 0.8s linear infinite; }
  `],
  template: `
    <div [style]="bg" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;">
      <div style="width:100%;max-width:380px;" class="fade-in">

        <!-- Logo -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:rgba(212,160,23,0.08);border:1px solid rgba(212,160,23,0.18);margin-bottom:16px;">
            <img src="cineo-mark.svg" width="32" height="32" alt="Cineo">
          </div>
          <div style="font-size:24px;font-weight:700;margin-bottom:6px;">
            <span style="color:var(--color-cinema-text);">Cin</span><span style="color:var(--color-cinema-gold);">eo</span>
          </div>
          <div style="font-size:13px;color:#444;">Tu universo cinematográfico</div>
        </div>

        <!-- Card -->
        <div style="background:var(--color-cinema-surface);border:1px solid rgba(212,160,23,0.12);border-radius:20px;padding:28px;box-shadow:0 32px 64px rgba(0,0,0,0.7);">
          <h2 style="color:var(--color-cinema-text);font-size:18px;font-weight:600;margin:0 0 20px 0;">Crear cuenta</h2>

          <!-- Server error -->
          <div *ngIf="error()" style="background:rgba(224,85,85,0.07);color:#e05555;border:1px solid rgba(224,85,85,0.2);border-radius:10px;padding:12px 14px;font-size:13px;margin-bottom:20px;">
            {{ error() }}
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <!-- Username -->
            <div style="margin-bottom:14px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Usuario</label>
              <input class="auth-input" type="text" formControlName="username" autocomplete="username" placeholder="tu_usuario" />
              <span class="field-error" *ngIf="f['username'].invalid && f['username'].touched">
                <ng-container *ngIf="f['username'].errors?.['required']">El usuario es obligatorio.</ng-container>
                <ng-container *ngIf="f['username'].errors?.['minlength']">Mínimo 3 caracteres.</ng-container>
                <ng-container *ngIf="f['username'].errors?.['maxlength']">Máximo 20 caracteres.</ng-container>
              </span>
            </div>

            <!-- Email -->
            <div style="margin-bottom:14px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Email</label>
              <input class="auth-input" type="email" formControlName="email" autocomplete="email" placeholder="tu@email.com" />
              <span class="field-error" *ngIf="f['email'].invalid && f['email'].touched">
                <ng-container *ngIf="f['email'].errors?.['required']">El email es obligatorio.</ng-container>
                <ng-container *ngIf="f['email'].errors?.['email']">Introduce un email válido.</ng-container>
              </span>
            </div>

            <!-- Password -->
            <div style="margin-bottom:22px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Contraseña</label>
              <input class="auth-input" type="password" formControlName="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres" />
              <span class="field-error" *ngIf="f['password'].invalid && f['password'].touched">
                <ng-container *ngIf="f['password'].errors?.['required']">La contraseña es obligatoria.</ng-container>
                <ng-container *ngIf="f['password'].errors?.['minlength']">Mínimo 6 caracteres.</ng-container>
              </span>
            </div>

            <button type="submit" class="auth-btn" [disabled]="loading()">
              <svg *ngIf="loading()" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ loading() ? 'Registrando...' : 'Crear cuenta' }}
            </button>
          </form>
        </div>

        <p style="text-align:center;font-size:13px;color:#444;margin-top:20px;">
          ¿Ya tienes cuenta?
          <a routerLink="/login" style="color:var(--color-cinema-gold);text-decoration:none;font-weight:500;margin-left:4px;">Inicia sesión</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly bg = FILM_BG;

  readonly form = inject(FormBuilder).group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const { username, email, password } = this.form.getRawValue();
    this.auth.register({ username: username!, email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 409 ? 'El usuario o email ya existe.' : 'Error al registrarse. Inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }
}
