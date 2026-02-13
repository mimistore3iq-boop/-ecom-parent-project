// Firebase Service Worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyC9q1xKq4x4x4x4x4x4x4x4x4x4x4x4x4x",
  authDomain: "ecomproject-a8173.firebaseapp.com",
  projectId: "ecomproject-a8173",
  storageBucket: "ecomproject-a8173.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'voro';
  const notificationOptions = {
    body: payload.notification.body || 'لديك إشعار جديد',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'voro-notification',
    requireInteraction: true,
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'فتح',
        icon: '/logo192.png'
      },
      {
        action: 'view_order',
        title: 'عرض الطلب'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  if (event.action === 'view_order' && event.notification.data.order_id) {
    // Open the order details page
    event.waitUntil(
      clients.openWindow(`/admin/orders/${event.notification.data.order_id}`)
    );
  } else if (event.action === 'open') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});