/**
 * Android Native Web APIs Bridge:
 * - Haptic Vibration Feedback (navigator.vibrate)
 * - Screen Wake Lock (navigator.wakeLock)
 * - Android App Icon Badging (navigator.setAppBadge)
 * - Native System Share Sheet (navigator.share)
 * - Android System Notifications (Notification API)
 * - Android PWA Installation (beforeinstallprompt)
 */

export type HapticPattern = 'tap' | 'tick' | 'medium' | 'success' | 'warning' | 'celebrate';

export function triggerHaptic(pattern: HapticPattern = 'tap') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (pattern) {
      case 'tap':
        navigator.vibrate(15);
        break;
      case 'tick':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(35);
        break;
      case 'success':
        navigator.vibrate([25, 40, 50]);
        break;
      case 'warning':
        navigator.vibrate([60, 50, 60]);
        break;
      case 'celebrate':
        navigator.vibrate([40, 50, 50, 40, 100]);
        break;
      default:
        navigator.vibrate(20);
    }
  } catch {
    // ignore
  }
}

// Android Screen Wake Lock manager
let wakeLockSentinel: any = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) return false;

  try {
    wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch {
    return false;
  }
}

export async function releaseScreenWakeLock() {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // ignore
    }
    wakeLockSentinel = null;
  }
}

// Android Home Screen App Icon Badging
export function setAndroidAppBadge(count: number) {
  if (typeof window === 'undefined') return;

  try {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        (navigator as any).setAppBadge(count);
      } else {
        (navigator as any).clearAppBadge();
      }
    }
  } catch {
    // ignore
  }
}

// Android Native Share Sheet
export async function shareViaAndroid(payload: { title: string; text?: string; url?: string }): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator.share) {
    try {
      await navigator.share(payload);
      triggerHaptic('success');
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Android share error:', err);
      }
      return false;
    }
  }

  // Fallback to clipboard
  if (typeof window !== 'undefined' && navigator.clipboard) {
    const textToCopy = [payload.title, payload.text, payload.url].filter(Boolean).join('\n\n');
    await navigator.clipboard.writeText(textToCopy);
    triggerHaptic('tap');
    return false;
  }

  return false;
}

// Android System Notifications
export async function sendAndroidNotification(title: string, body: string, icon = '/icons/icon-192.png') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
        ...({ vibrate: [100, 50, 100] } as any)
      });
      triggerHaptic('warning');
    } catch {
      // ignore
    }
  }
}
