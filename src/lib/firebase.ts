
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "career-compass-iz1m1",
  appId: "1:1011164956750:web:4a6f458cf7e243d2cb5b1f",
  storageBucket: "career-compass-iz1m1.firebasestorage.app",
  apiKey: "AIzaSyA6vB9eQlkIQMNivEWmSYTD2HH635KhniY",
  authDomain: "career-compass-iz1m1.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1011164956750",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };
