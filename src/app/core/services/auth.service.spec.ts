import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth.service';

function fakeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: Router, useValue: router }],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('reports logged out when there is no token', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getUsername()).toBeNull();
    expect(service.getUserId()).toBeNull();
    expect(service.isAdmin()).toBe(false);
  });

  it('reports logged in and decodes claims for a valid, non-expired token', () => {
    const token = fakeToken({
      sub: 'esteban',
      role: 'ADMIN',
      userId: 42,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    localStorage.setItem('cineapi_token', token);

    expect(service.isLoggedIn()).toBe(true);
    expect(service.getUsername()).toBe('esteban');
    expect(service.getUserId()).toBe(42);
    expect(service.isAdmin()).toBe(true);
  });

  it('reports logged out for an expired token', () => {
    const token = fakeToken({
      sub: 'esteban',
      role: 'USER',
      userId: 1,
      exp: Math.floor(Date.now() / 1000) - 3600,
    });
    localStorage.setItem('cineapi_token', token);

    expect(service.isLoggedIn()).toBe(false);
  });

  it('logout clears the token and navigates to the given path', () => {
    localStorage.setItem('cineapi_token', fakeToken({ sub: 'x', role: 'USER', userId: 1, exp: 9999999999 }));

    service.logout('/login');

    expect(localStorage.getItem('cineapi_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
