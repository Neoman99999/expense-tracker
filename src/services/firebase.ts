import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyD3jMUAxySRbBUiFJhyJuYsL_lVytn3aaE',
  authDomain: 'expense-tracker-neoman.firebaseapp.com',
  projectId: 'expense-tracker-neoman',
  storageBucket: 'expense-tracker-neoman.firebasestorage.app',
  messagingSenderId: '437745285506',
  appId: '1:437745285506:web:7ad4462445a7b64c3b779b',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: Platform.OS === 'web'
      ? browserLocalPersistence
      : getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
