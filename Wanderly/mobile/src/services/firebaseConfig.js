import { initializeApp } from "firebase/app";
import {initializeAuth, getAuth, GoogleAuthProvider, browserLocalPersistence, getReactNativePersistence,} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from 'expo-constants';

// Firebase configuration from Expo config extra (fallback to process.env)
const env = (Constants.expoConfig && Constants.expoConfig.extra) || process.env;
const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Helpful debug: if running locally, log the config values (without revealing secrets to logs in prod)
if (__DEV__) {
  // show whether values are present; do not print the full apiKey in logs
  console.log('Firebase config loaded:', {
    hasApiKey: !!firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    hasAppId: !!firebaseConfig.appId,
  });
}

// Validate basic config to avoid obscure runtime errors
if (!firebaseConfig.apiKey) {
  console.error('Missing Firebase API key. Ensure EXPO_PUBLIC_FIREBASE_API_KEY is set in .env and provided via app.config.js');
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Set auth persistence based on platform (Web vs React Native)
const auth =
  Platform.OS === "web"
    ? initializeAuth(app, { persistence: browserLocalPersistence })
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const authInstance = getAuth(app);         // Firebase Auth instance
const provider = new GoogleAuthProvider(); // Google OAuth provider

export { app, auth, authInstance, provider };
