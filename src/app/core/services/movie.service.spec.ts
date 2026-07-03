import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MovieService } from './movie.service';
import { environment } from '../../../environments/environment';
import { Movie, MovieRequest, Page } from '../models/models';

const BASE = `${environment.apiUrl}/movies`;

function mockMovie(override: Partial<Movie> = {}): Movie {
  return { id: 1, title: 'Test', description: 'Desc', movieYear: 2024, votes: 5, rating: 7.0, imageUrl: '', genres: [], ...override };
}

function mockPage<T>(content: T[]): Page<T> {
  return { content, totalElements: content.length, totalPages: 1, currentPage: 0 };
}

describe('MovieService', () => {
  let service: MovieService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovieService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('getAll()', () => {
    it('uses page=0 and size=20 by default', () => {
      service.getAll().subscribe();
      const req = http.expectOne((r) => r.url === BASE && r.params.get('page') === '0' && r.params.get('size') === '20');
      expect(req.request.method).toBe('GET');
      req.flush(mockPage([]));
    });

    it('passes custom page and size', () => {
      service.getAll(2, 10).subscribe();
      const req = http.expectOne((r) => r.url === BASE && r.params.get('page') === '2' && r.params.get('size') === '10');
      req.flush(mockPage([]));
    });

    it('returns the page body from the server', () => {
      const page = mockPage([mockMovie()]);
      let result: Page<Movie> | undefined;
      service.getAll().subscribe((p) => (result = p));
      http.expectOne((r) => r.url === BASE).flush(page);
      expect(result).toEqual(page);
    });
  });

  describe('getById()', () => {
    it('sends GET /movies/:id and returns the movie', () => {
      const movie = mockMovie({ id: 42 });
      let result: Movie | undefined;
      service.getById(42).subscribe((m) => (result = m));
      const req = http.expectOne(`${BASE}/42`);
      expect(req.request.method).toBe('GET');
      req.flush(movie);
      expect(result).toEqual(movie);
    });
  });

  describe('searchByTitle()', () => {
    it('sends GET /movies/title with title, page, and size params', () => {
      service.searchByTitle('Matrix', 1, 5).subscribe();
      const req = http.expectOne(
        (r) => r.url === `${BASE}/title` && r.params.get('title') === 'Matrix' && r.params.get('page') === '1' && r.params.get('size') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage([]));
    });
  });

  describe('getByGenre()', () => {
    it('encodes the genre name in the path and adds pagination params', () => {
      service.getByGenre('Sci-Fi', 0, 20).subscribe();
      const req = http.expectOne(
        (r) => r.url === `${BASE}/genre/Sci-Fi` && r.params.get('page') === '0'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage([]));
    });
  });

  describe('create()', () => {
    it('sends POST /movies with the request body', () => {
      const body: MovieRequest = { title: 'New', description: 'Desc', movieYear: 2024, imageUrl: '', genreIds: [1, 2] };
      let result: Movie | undefined;
      service.create(body).subscribe((m) => (result = m));
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      const movie = mockMovie();
      req.flush(movie);
      expect(result).toEqual(movie);
    });
  });

  describe('update()', () => {
    it('sends PUT /movies/:id with the request body', () => {
      const body: MovieRequest = { title: 'Updated', description: 'Desc', movieYear: 2025, imageUrl: '', genreIds: [] };
      service.update(7, body).subscribe();
      const req = http.expectOne(`${BASE}/7`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(mockMovie({ id: 7 }));
    });
  });

  describe('delete()', () => {
    it('sends DELETE /movies/:id', () => {
      service.delete(99).subscribe();
      const req = http.expectOne(`${BASE}/99`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('vote()', () => {
    it('sends PUT /movies/:id/vote/:rating', () => {
      service.vote(3, 8).subscribe();
      const req = http.expectOne(`${BASE}/3/vote/8`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockMovie({ rating: 8 }));
    });
  });

  describe('getVoteStatus()', () => {
    it('sends GET /movies/:id/voted and returns a boolean', () => {
      let result: boolean | undefined;
      service.getVoteStatus(5).subscribe((v) => (result = v));
      const req = http.expectOne(`${BASE}/5/voted`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
      expect(result).toBe(true);
    });
  });
});
