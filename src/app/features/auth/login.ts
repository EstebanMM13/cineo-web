import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { FILM_BG, AUTH_FORM_STYLES } from '../../shared/auth/auth-styles';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styles: [AUTH_FORM_STYLES],
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
          <h2 style="color:var(--color-cinema-text);font-size:18px;font-weight:600;margin:0 0 20px 0;">Iniciar sesión</h2>

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
              </span>
            </div>

            <!-- Password -->
            <div style="margin-bottom:22px;">
              <label style="display:block;font-size:11px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:7px;">Contraseña</label>
              <input class="auth-input" type="password" formControlName="password" autocomplete="current-password" placeholder="••••••••" />
              <span class="field-error" *ngIf="f['password'].invalid && f['password'].touched">
                <ng-container *ngIf="f['password'].errors?.['required']">La contraseña es obligatoria.</ng-container>
                <ng-container *ngIf="f['password'].errors?.['minlength']">Mínimo 6 caracteres.</ng-container>
              </span>
            </div>

            <button type="submit" class="auth-btn" [disabled]="loading()">
              <svg *ngIf="loading()" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ loading() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </div>

        <p style="text-align:center;font-size:13px;color:#444;margin-top:20px;">
          ¿No tienes cuenta?
          <a routerLink="/register" style="color:var(--color-cinema-gold);text-decoration:none;font-weight:500;margin-left:4px;">Regístrate</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly bg = FILM_BG;

  readonly form = inject(FormBuilder).group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.form.getRawValue();
    this.auth.login({ username: username!, password: password! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 0 ? 'No se ha podido contactar con el servidor.' : 'Usuario o contraseña incorrectos.');
        this.loading.set(false);
      },
    });
  }
}
