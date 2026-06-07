// Firebase Cloud Messaging service worker
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase";

// Get messaging instance only when Firebase is configured (app is null locally
// when REACT_APP_FIREBASE_* env vars are absent). Avoids a load-time crash.
let messaging = null;
if (app) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging unavailable:', error?.message || error);
  }
}

// Register service worker
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
};

// Get FCM token
export const getFCMToken = async () => {
  if (!messaging) {
    return null;
  }
  try {
    const currentToken = await getToken(messaging, { vapidKey: "38763797948fac18689f45fcb5bb9c5152d82738" });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return true;
    } else {
      console.log('Unable to get permission to notify.');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      return;
    }
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

// Register admin token for notifications
export const registerAdminToken = async (token) => {
  try {
    const response = await fetch('/api/orders/register_admin_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Admin token registered successfully:', data);
      return true;
    } else {
      console.error('Failed to register admin token');
      return false;
    }
  } catch (error) {
    console.error('Error registering admin token:', error);
    return false;
  }
};
