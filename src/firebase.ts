import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Public web configuration. Access is enforced by Authentication and firestore.rules.
const app = initializeApp({
  apiKey: 'AIzaSyBuYdY0ETor5IfYeSyZIrrt_PnRb7SrRNw',
  authDomain: 'mathella-f7da0.firebaseapp.com',
  projectId: 'mathella-f7da0',
  storageBucket: 'mathella-f7da0.firebasestorage.app',
  messagingSenderId: '920903463586',
  appId: '1:920903463586:web:2457fe7b4936a5a8baddfb',
});
export const auth = getAuth(app);
export const db = getFirestore(app);
// Analytics and persistent database caching are intentionally not enabled.
