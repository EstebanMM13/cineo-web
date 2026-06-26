import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Genre, Page } from '../models/models';

@Injectable({ providedIn: 'root' })
export class GenreService {
  private base = `${environment.apiUrl}/genres`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 100): Observable<Page<Genre>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Genre>>(this.base, { params });
  }

  getById(id: number): Observable<Genre> {
    return this.http.get<Genre>(`${this.base}/${id}`);
  }

  create(name: string): Observable<Genre> {
    return this.http.post<Genre>(this.base, { name });
  }

  update(id: number, name: string): Observable<Genre> {
    return this.http.patch<Genre>(`${this.base}/${id}`, { name });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
