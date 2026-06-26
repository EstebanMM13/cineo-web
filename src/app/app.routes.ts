import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'movies/:id',
    loadComponent: () => import('./features/movie-detail/movie-detail').then((m) => m.MovieDetailComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-layout').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'movies', pathMatch: 'full' },
      {
        path: 'movies',
        loadComponent: () => import('./features/admin/admin-movies').then((m) => m.AdminMoviesComponent),
      },
      {
        path: 'genres',
        loadComponent: () => import('./features/admin/admin-genres').then((m) => m.AdminGenresComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-users').then((m) => m.AdminUsersComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
