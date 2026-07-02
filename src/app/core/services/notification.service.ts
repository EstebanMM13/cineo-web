import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'error' | 'success' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  readonly notifications = this.notifications$.asObservable();

  error(message: string): void {
    this.push('error', message);
  }

  success(message: string): void {
    this.push('success', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.notifications$.next(this.notifications$.value.filter((n) => n.id !== id));
  }

  private push(type: NotificationType, message: string): void {
    const id = this.nextId++;
    this.notifications$.next([...this.notifications$.value, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
