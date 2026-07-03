import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { HomeComponent } from './home';
import { MovieService } from '../../core/services/movie.service';
import { Movie, Page } from '../../core/models/models';

function mockMovie(override: Partial<Movie> = {}): Movie {
  return { id: 1, title: 'Test', description: '', movieYear: 2024, votes: 0, rating: 0, imageUrl: '', genres: [], ...override };
}

function mockPage<T>(content: T[], totalPages = 1, totalElements?: number): Page<T> {
  return { content, totalPages, totalElements: totalElements ?? content.length, currentPage: 0 };
}

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let movieService: { getAll: ReturnType<typeof vi.fn>; searchByTitle: ReturnType<typeof vi.fn>; getByGenre: ReturnType<typeof vi.fn> };
  let queryParams$: BehaviorSubject<Params>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    queryParams$ = new BehaviorSubject<Params>({});
    movieService = {
      getAll: vi.fn().mockReturnValue(of(mockPage([]))),
      searchByTitle: vi.fn().mockReturnValue(of(mockPage([]))),
      getByGenre: vi.fn().mockReturnValue(of(mockPage([]))),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$.asObservable() } },
        { provide: MovieService, useValue: movieService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  describe('data fetching', () => {
    it('calls getAll() when there are no query params', () => {
      const states: any[] = [];
      component.vm$.subscribe((s) => states.push(s));
      expect(movieService.getAll).toHaveBeenCalledWith(0);
      expect(movieService.searchByTitle).not.toHaveBeenCalled();
      expect(movieService.getByGenre).not.toHaveBeenCalled();
    });

    it('calls searchByTitle() when the q param is present', () => {
      queryParams$.next({ q: 'Matrix' });
      component.vm$.subscribe();
      expect(movieService.searchByTitle).toHaveBeenCalledWith('Matrix', 0);
      expect(movieService.getAll).not.toHaveBeenCalled();
    });

    it('calls getByGenre() when the genre param is present', () => {
      queryParams$.next({ genre: 'Action' });
      component.vm$.subscribe();
      expect(movieService.getByGenre).toHaveBeenCalledWith('Action', 0);
      expect(movieService.getAll).not.toHaveBeenCalled();
    });

    it('passes the page param to the service', () => {
      queryParams$.next({ page: '2' });
      component.vm$.subscribe();
      expect(movieService.getAll).toHaveBeenCalledWith(2);
    });
  });

  describe('vm$ states', () => {
    it('emits a loading state before the data arrives', () => {
      const states: any[] = [];
      component.vm$.subscribe((s) => states.push(s));
      // startWith fires before of() completes — states[0] is loading
      expect(states[0].loading).toBe(true);
    });

    it('emits a loaded state with movies after the request resolves', () => {
      const movies = [mockMovie({ id: 1 }), mockMovie({ id: 2 })];
      movieService.getAll.mockReturnValue(of(mockPage(movies, 3, 50)));
      const states: any[] = [];
      component.vm$.subscribe((s) => states.push(s));
      const last = states.at(-1);
      expect(last.loading).toBe(false);
      expect(last.movies).toEqual(movies);
      expect(last.totalPages).toBe(3);
      expect(last.totalMovies).toBe(50);
    });

    it('emits an empty state when the HTTP call fails', () => {
      movieService.getAll.mockReturnValue(throwError(() => new Error('Network error')));
      const states: any[] = [];
      component.vm$.subscribe((s) => states.push(s));
      const last = states.at(-1);
      expect(last.loading).toBe(false);
      expect(last.movies).toHaveLength(0);
      expect(last.totalMovies).toBe(0);
    });

    it('exposes the active search query in the view model', () => {
      queryParams$.next({ q: 'Inception' });
      movieService.searchByTitle.mockReturnValue(of(mockPage([])));
      let vm: any;
      component.vm$.subscribe((s) => (vm = s));
      expect(vm.searchQuery).toBe('Inception');
    });

    it('exposes the active genre in the view model', () => {
      queryParams$.next({ genre: 'Drama' });
      movieService.getByGenre.mockReturnValue(of(mockPage([])));
      let vm: any;
      component.vm$.subscribe((s) => (vm = s));
      expect(vm.activeGenre).toBe('Drama');
    });
  });

  describe('distinctUntilChanged', () => {
    it('does not re-fetch when the same params are emitted twice', () => {
      component.vm$.subscribe();
      expect(movieService.getAll).toHaveBeenCalledTimes(1);
      queryParams$.next({}); // same effective params: q='', genre='', page=0
      expect(movieService.getAll).toHaveBeenCalledTimes(1); // no second call
    });

    it('re-fetches when a param actually changes', () => {
      component.vm$.subscribe();
      queryParams$.next({ q: 'Matrix' });
      movieService.searchByTitle.mockReturnValue(of(mockPage([])));
      component.vm$.subscribe();
      expect(movieService.searchByTitle).toHaveBeenCalledWith('Matrix', 0);
    });
  });

  describe('clearFilters()', () => {
    it('navigates to / with no query params', () => {
      component.clearFilters();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('onPageChange()', () => {
    it('navigates to the same route merging the new page into query params', () => {
      component.onPageChange(3);
      expect(router.navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ queryParams: { page: 3 }, queryParamsHandling: 'merge' })
      );
    });
  });

  describe('trackByMovie()', () => {
    it('returns the movie id', () => {
      const movie = mockMovie({ id: 42 });
      expect(component.trackByMovie(0, movie)).toBe(42);
    });
  });
});
