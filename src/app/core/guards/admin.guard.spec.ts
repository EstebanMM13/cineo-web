import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  let authService: { isLoggedIn: ReturnType<typeof vi.fn>; isAdmin: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { isLoggedIn: vi.fn(), isAdmin: vi.fn() };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  function runGuard(): boolean {
    return TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any)) as boolean;
  }

  it('allows navigation for a logged-in admin', () => {
    authService.isLoggedIn.mockReturnValue(true);
    authService.isAdmin.mockReturnValue(true);

    expect(runGuard()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to / when logged in but not an admin', () => {
    authService.isLoggedIn.mockReturnValue(true);
    authService.isAdmin.mockReturnValue(false);

    expect(runGuard()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('redirects to / when not logged in', () => {
    authService.isLoggedIn.mockReturnValue(false);
    authService.isAdmin.mockReturnValue(false);

    expect(runGuard()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
