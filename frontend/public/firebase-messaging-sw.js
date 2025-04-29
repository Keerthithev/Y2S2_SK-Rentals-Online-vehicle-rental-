// Import the necessary Firebase scripts for v9
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getMessaging, onBackgroundMessage } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyB51FE0Mi5nKyP7n4SWKhg32LoTootgthI",
  authDomain: "sk-vehicle-rental.firebaseapp.com",
  projectId: "sk-vehicle-rental",
  storageBucket: "sk-vehicle-rental.firebasestorage.app",
  messagingSenderId: "455591049001",
  appId: "1:455591049001:web:8d1ac98447f495541b6938",
  measurementId: "G-1C0NWNWLP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// Make sure Firebase messaging service worker is registered
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js').then((registration) => {
    console.log('Service Worker registered with scope: ', registration.scope);
    
    // Set up background message handler inside the service worker
    onBackgroundMessage(messaging, (payload) => {
      console.log('Received background message: ', payload);

      // Customize notification here
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png'
      };

      // Show notification
      registration.showNotification(notificationTitle, notificationOptions);
    });
  }).catch((error) => {
    console.error('Service Worker registration failed: ', error);
  });
}
