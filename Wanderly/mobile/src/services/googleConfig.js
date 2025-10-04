import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { makeRedirectUri } from "expo-auth-session";

// Custom hook for Google OAuth
// Must be used inside SignInScreen or SignUpScreen
export function useGoogleAuth() {
  WebBrowser.maybeCompleteAuthSession(); // Handle OAuth redirect if needed

  // Configure Google Auth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    // iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Web client ID from Firebase
    redirectUri: makeRedirectUri({ useProxy: true }),          // Redirect URI for Expo
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      // Google login successful, got ID token
      // Typically send this token to backend to exchange for JWT
      console.log("✅ Got Google ID token:", id_token);
    }
  }, [response]);

  return { request, promptAsync, response }; // Return request info and prompt function
}
 