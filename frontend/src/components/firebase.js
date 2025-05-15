// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlmVsCTUoM2fP57Q3jcTqYGOdpw6DL16s",
  authDomain: "sk-vehicle-rental-1234.firebaseapp.com",
  projectId: "sk-vehicle-rental-1234",
  storageBucket: "sk-vehicle-rental-1234.firebasestorage.app",
  messagingSenderId: "884383912968",
  appId: "1:884383912968:web:811b843e17a2282a952dbd",
  measurementId: "G-W089E86Z4F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);