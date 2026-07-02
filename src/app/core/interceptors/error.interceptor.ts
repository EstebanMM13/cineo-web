import { HttpContext, HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

const AUTH_PATHS = ['/auth/authenticate', '/auth/register'];

/** Attach via `context: withSkipErrorNotification()` when a caller shows its own error message. */
export const SKIP_ERROR_NOTIFICATION = new HttpContextToken<boolean>(() => false);
export function withSkipErrorNotification(): HttpContext {
  return new HttpContext().set(SKIP_ERROR_NOTIFICATION, true);
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notifications = inject(NotificationService);

  const isAuthRequest = AUTH_PATHS.some((path) => req.url.includes(path));

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isAuthRequest || req.context.get(SKIP_ERROR_NOTIFICATION)) {
        return throwError(() => err);
      }

      if (err.status === 401) {
        auth.logout('/login');
        notifications.error('Tu sesión ha caducado. Inicia sesión de nuevo.');
        return throwError(() => err);
      }

      const message = err.error?.message || defaultMessageFor(err.status);
      notifications.error(message);
      return throwError(() => err);
    })
  );
};

function defaultMessageFor(status: number): string {
  switch (status) {
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'No se ha encontrado el recurso solicitado.';
    case 409:
      return 'La operación entra en conflicto con el estado actual.';
    case 0:
      return 'No se ha podido contactar con el servidor.';
    default:
      return 'Ha ocurrido un error inesperado.';
  }
}
