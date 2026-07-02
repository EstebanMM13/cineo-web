import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieRequest, Page } from '../models/models';
import { withSkipErrorNotification } from '../interceptors/error.interceptor';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private base = `${environment.apiUrl}/movies`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<Page<Movie>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Movie>>(this.base, { params });
  }

  getById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.base}/${id}`);
  }

  searchByTitle(title: string, page = 0, size = 20): Observable<Page<Movie>> {
    const params = new HttpParams().set('title', title).set('page', page).set('size', size);
    return this.http.get<Page<Movie>>(`${this.base}/title`, { params });
  }

  getByGenre(genreName: string, page = 0, size = 20): Observable<Page<Movie>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Movie>>(`${this.base}/genre/${encodeURIComponent(genreName)}`, { params });
  }

  vote(movieId: number, rating: number): Observable<Movie> {
    return this.http.put<Movie>(`${this.base}/${movieId}/vote/${rating}`, {}, { context: withSkipErrorNotification() });
  }

  getVoteStatus(movieId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/${movieId}/vote/status`);
  }

  create(movie: MovieRequest): Observable<Movie> {
    return this.http.post<Movie>(this.base, movie);
  }

  update(id: number, movie: MovieRequest): Observable<Movie> {
    return this.http.put<Movie>(`${this.base}/${id}`, movie);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
