import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .toast-stack { position:fixed; bottom:20px; right:20px; z-index:1000; display:flex; flex-direction:column; gap:8px; max-width:340px; }
    .toast { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; border-radius:10px; font-size:13px; line-height:1.4; background:var(--color-cinema-surface); border:1px solid var(--color-cinema-border); box-shadow:0 12px 32px rgba(0,0,0,0.6); animation:toast-in 0.2s ease-out; }
    @keyframes toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    .toast.error { border-color:rgba(224,85,85,0.35); color:#f0a0a0; }
    .toast.success { border-color:rgba(212,160,23,0.35); color:var(--color-cinema-gold); }
    .toast.info { border-color:#2a2a2a; color:var(--color-cinema-text); }
    .toast-close { background:transparent; border:none; color:inherit; opacity:0.6; cursor:pointer; padding:0; margin-left:auto; font-size:16px; line-height:1; }
    .toast-close:hover { opacity:1; }
  `],
  template: `
    <div class="toast-stack">
      <div *ngFor="let n of notifications.notifications | async" class="toast" [class]="n.type">
        <span>{{ n.message }}</span>
        <button class="toast-close" (click)="notifications.dismiss(n.id)" aria-label="Cerrar notificación">&times;</button>
      </div>
    </div>
  `,
})
export class ToastComponent {
  constructor(public notifications: NotificationService) {}
}
