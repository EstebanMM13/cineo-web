export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  movieYear: number;
  votes: number;
  rating: number;
  imageUrl: string;
  genres: Genre[];
}

export interface Review {
  id: number;
  comment: string;
  createdAt: string;
  userId: number;
  username: string;
  movieTitle: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface SystemStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize?: number;
  number?: number;
}

export interface AuthRequest {
  username: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
}

export interface MovieRequest {
  title: string;
  description: string;
  movieYear: number;
  imageUrl: string;
  genreIds: number[];
}

export interface ReviewRequest {
  comment: string;
}

export interface DecodedToken {
  sub: string;
  role: string;
  userId: number;
  exp: number;
}
