import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyBjNR3EG8aDlEgV2u6nXOvQHwop-NjLKZ0",
    authDomain: "typehaki-fdba0.firebaseapp.com",
    projectId: "typehaki-fdba0",
    storageBucket: "typehaki-fdba0.firebasestorage.app",
    messagingSenderId: "635541189448",
    appId: "1:635541189448:web:8d887eec0e6ee21cccf97d",
    measurementId: "G-G0CZYKDKHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Providers
export const googleProvider = new GoogleAuthProvider();

// Admin emails - multiple admins for TypeHaki
export const ADMIN_EMAILS = [
  "sathwikprabhu07@gmail.com",
  "rishikonda678@gmail.com"
];

// For backward compatibility
export const ADMIN_EMAIL = ADMIN_EMAILS[0];

export default app;
