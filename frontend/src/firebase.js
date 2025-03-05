// Import the required Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB51FE0Mi5nKyP7n4SWKhg32LoTootgthI",
  authDomain: "sk-vehicle-rental.firebaseapp.com",
  projectId: "sk-vehicle-rental",
  storageBucket: "sk-vehicle-rental.firebasestorage.app",
  messagingSenderId: "455591049001",
  appId: "1:455591049001:web:7b29aac8c97205e31b6938",
  measurementId: "G-ZJ5SX8EVYR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Firebase Authentication
const firestore = getFirestore(app); // Firestore Database
const storage = getStorage(app); // Firebase Storage

// Export initialized services
export { app, auth, firestore, storage };
