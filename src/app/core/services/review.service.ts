import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page, Review, ReviewRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private base = `${environment.apiUrl}/movies`;

  constructor(private http: HttpClient) {}

  getByMovie(movieId: number, page = 0, size = 20): Observable<Page<Review>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Review>>(`${this.base}/${movieId}/reviews`, { params });
  }

  create(movieId: number, body: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.base}/${movieId}/reviews`, body);
  }

  update(movieId: number, reviewId: number, body: ReviewRequest): Observable<Review> {
    return this.http.patch<Review>(`${this.base}/${movieId}/reviews/${reviewId}`, body);
  }

  delete(movieId: number, reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${movieId}/reviews/${reviewId}`);
  }
}
