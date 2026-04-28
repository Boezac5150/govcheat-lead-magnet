import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export interface PushNotificationSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

/**
 * Hook to manage push notifications
 * Handles registration, subscription, and notification display
 */
/**
 * Convert base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushNotificationSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscribeMutation = trpc.notifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.notifications.unsubscribe.useMutation();

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscriptionStatus();
    }
  }, []);

  /**
   * Check if user is already subscribed to push notifications
   */
  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub as any);
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error('[Push Notifications] Error checking subscription status:', err);
      setError('Failed to check notification status');
    }
  };

  /**
   * Register service worker and request notification permission
   */
  const registerServiceWorker = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers are not supported');
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      console.log('[Push Notifications] Service Worker registered:', registration);
      return registration;
    } catch (err) {
      console.error('[Push Notifications] Service Worker registration failed:', err);
      throw err;
    }
  };

  /**
   * Request notification permission and subscribe to push notifications
   */
  const subscribe = async () => {
    try {
      setError(null);

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      const registration = await registerServiceWorker();

      // Subscribe to push notifications
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      // Convert base64 VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey) as BufferSource;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Send subscription to backend
      const authKey = sub.getKey('auth');
      const p256dhKey = sub.getKey('p256dh');

      if (!authKey || !p256dhKey) {
        throw new Error('Failed to get subscription keys');
      }

      await subscribeMutation.mutateAsync({
        endpoint: sub.endpoint,
        auth: arrayBufferToBase64(authKey),
        p256dh: arrayBufferToBase64(p256dhKey),
      });

      setSubscription(sub as any);
      setIsSubscribed(true);
      console.log('[Push Notifications] Successfully subscribed');
    } catch (err: any) {
      console.error('[Push Notifications] Subscription failed:', err);
      setError(err.message || 'Failed to subscribe to notifications');
      throw err;
    }
  };

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = async () => {
    try {
      setError(null);

      if (!subscription) {
        throw new Error('Not subscribed to push notifications');
      }

      // Unsubscribe from push manager
      const registration = await navigator.serviceWorker.ready;
      const success = await registration.pushManager.getSubscription().then((sub) => {
        if (sub) {
          return sub.unsubscribe();
        }
        return false;
      });

      if (success) {
        // Notify backend
        await unsubscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
        });

        setSubscription(null);
        setIsSubscribed(false);
        console.log('[Push Notifications] Successfully unsubscribed');
      }
    } catch (err: any) {
      console.error('[Push Notifications] Unsubscription failed:', err);
      setError(err.message || 'Failed to unsubscribe from notifications');
      throw err;
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    error,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
    isLoading: subscribeMutation.isPending || unsubscribeMutation.isPending,
  };
}
