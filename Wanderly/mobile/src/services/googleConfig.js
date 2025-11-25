import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession(); // Finalizes auth session if redirected back

export function useGoogleAuth() {
  // Create redirect URI based on platform (mobile uses proxy)
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: Platform.OS !== "web",
  });

  // Google OAuth request configuration
  // Read values from Expo Constants extra if possible, fallback to process.env
  const env = (Constants.expoConfig && Constants.expoConfig.extra) || process.env;
  const androidClientId = env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const webClientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    iosClientId,
    webClientId,
    redirectUri,
    scopes: ["profile", "email"], // Request basic user info
  });

  // Validate config for platform
  if (Platform.OS === 'web' && !webClientId) {
    console.error('Google webClientId is missing. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env or EAS secrets.');
  }
  if (Platform.OS === 'android' && !androidClientId) {
    console.error('Google androidClientId is missing. Set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in your .env or EAS secrets.');
  }
  if (Platform.OS === 'ios' && !iosClientId) {
    console.error('Google iosClientId is missing. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in your .env or EAS secrets.');
  }
  if (__DEV__) {
    console.log('Google clientIds, has:', {
      hasWeb: !!webClientId,
      hasIos: !!iosClientId,
      hasAndroid: !!androidClientId,
      redirectUri,
    });
  }

  // Handle Google login response
  useEffect(() => {
    if (response?.type === "success") {
      const id_token = response.authentication?.idToken || response.params?.id_token;
      console.log("Google ID token:", id_token);
    } else if (response?.type === "error") {
      console.error("Google OAuth error:", response);
    }
  }, [response]);

  // Return tools to trigger and access OAuth results
  return { request, promptAsync, response, redirectUri };
}
