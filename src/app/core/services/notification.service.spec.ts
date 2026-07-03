import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Notification, NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let current: Notification[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    service.notifications.subscribe((n) => (current = n));
  });

  it('starts with no notifications', () => {
    expect(current).toHaveLength(0);
  });

  it('error() adds an error notification', () => {
    service.error('Something broke');
    expect(current).toHaveLength(1);
    expect(current[0]).toMatchObject({ type: 'error', message: 'Something broke' });
  });

  it('success() adds a success notification', () => {
    service.success('Saved!');
    expect(current[0]).toMatchObject({ type: 'success', message: 'Saved!' });
  });

  it('info() adds an info notification', () => {
    service.info('FYI');
    expect(current[0]).toMatchObject({ type: 'info', message: 'FYI' });
  });

  it('stacks multiple notifications without losing any', () => {
    service.error('E1');
    service.success('S1');
    service.info('I1');
    expect(current).toHaveLength(3);
  });

  it('assigns unique ids to each notification', () => {
    service.error('A');
    service.error('B');
    expect(current[0].id).not.toBe(current[1].id);
  });

  it('dismiss() removes the notification with the given id', () => {
    service.error('Remove me');
    const { id } = current[0];
    service.dismiss(id);
    expect(current).toHaveLength(0);
  });

  it('dismiss() only removes the targeted notification', () => {
    service.error('Keep');
    service.error('Remove');
    const idToRemove = current[1].id;
    service.dismiss(idToRemove);
    expect(current).toHaveLength(1);
    expect(current[0].message).toBe('Keep');
  });

  it('auto-dismisses after 5 seconds', () => {
    vi.useFakeTimers();
    service.error('Temporary');
    expect(current).toHaveLength(1);
    vi.advanceTimersByTime(5000);
    expect(current).toHaveLength(0);
    vi.useRealTimers();
  });

  it('does not dismiss before 5 seconds have elapsed', () => {
    vi.useFakeTimers();
    service.error('Still here');
    vi.advanceTimersByTime(4999);
    expect(current).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(current).toHaveLength(0);
    vi.useRealTimers();
  });
});
