// Haptics service for Web & Native iOS (iLoader WKWebView)

declare global {
  interface Window {
    isNativeIOSApp?: boolean;
    webkit?: {
      messageHandlers?: {
        haptics?: {
          postMessage: (style: string) => void;
        };
        timerAlert?: {
          postMessage: (data: { title: string; body: string }) => void;
        };
      };
    };
    nativeHaptic?: (style: string) => void;
    nativeTimerAlert?: (title: string, body: string) => void;
  }
}

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function triggerHaptic(style: HapticStyle = 'medium'): void {
  // 1. Try Native iOS message handler (iloader app)
  if (typeof window !== 'undefined') {
    if (window.nativeHaptic) {
      window.nativeHaptic(style);
      return;
    }
    if (window.webkit?.messageHandlers?.haptics) {
      window.webkit.messageHandlers.haptics.postMessage(style);
      return;
    }

    // 2. Fall back to standard Web Vibration API
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      switch (style) {
        case 'light':
          navigator.vibrate(15);
          break;
        case 'medium':
          navigator.vibrate(30);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([25, 40, 25]);
          break;
        case 'warning':
          navigator.vibrate([40, 50, 40]);
          break;
        case 'error':
          navigator.vibrate([60, 40, 60, 40, 60]);
          break;
      }
    }
  }
}

export function notifyRestTimerDone(exerciseName?: string): void {
  const title = "Rest Complete! 🔥";
  const body = exerciseName ? `Time for your next set of ${exerciseName}!` : "Time to lift again!";

  if (typeof window !== 'undefined') {
    if (window.nativeTimerAlert) {
      window.nativeTimerAlert(title, body);
    } else if (window.webkit?.messageHandlers?.timerAlert) {
      window.webkit.messageHandlers.timerAlert.postMessage({ title, body });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: './icon-192.png' });
      } catch {
        // Notification catch
      }
    }
  }
}
