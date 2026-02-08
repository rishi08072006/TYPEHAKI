import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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

// Enable IndexedDB persistence so Firestore can serve reads while offline.
// This improves resilience when users have flaky connectivity and avoids
// "Failed to get document because the client is offline" errors when cached
// data is available.
try {
  enableIndexedDbPersistence(db).catch((err) => {
    // Common errors: failed-precondition (multiple tabs) or unimplemented (browser)
    console.warn('Firestore persistence not enabled:', err.code || err.message || err);
  });
} catch (err) {
  // If enableIndexedDbPersistence throws synchronously, log and continue.
  console.warn('Error enabling Firestore persistence:', err);
}
