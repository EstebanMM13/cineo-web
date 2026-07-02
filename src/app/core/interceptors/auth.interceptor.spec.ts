import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { getToken: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('attaches the Authorization header when a token is present', () => {
    authService.getToken.mockReturnValue('fake-jwt');

    httpClient.get('/api/movies').subscribe();

    const req = httpMock.expectOne('/api/movies');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-jwt');
    req.flush({});
  });

  it('does not attach an Authorization header when there is no token', () => {
    authService.getToken.mockReturnValue(null);

    httpClient.get('/api/movies').subscribe();

    const req = httpMock.expectOne('/api/movies');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
