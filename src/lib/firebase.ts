import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyDa9MLgiLJNsz7lZm5h0Wsjbj3tArqjWqE",
    authDomain: "typehaki.firebaseapp.com",
    projectId: "typehaki",
    storageBucket: "typehaki.firebasestorage.app",
    messagingSenderId: "1007975808147",
    appId: "1:1007975808147:web:fa5492154e7b4ad40fa166",
    measurementId: "G-G99XM7MZ6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Providers
export const googleProvider = new GoogleAuthProvider();

// Admin email - single admin for TypeHaki
export const ADMIN_EMAIL = "sathwikprabhu07@gmail.com";

export default app;
