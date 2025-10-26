import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession(); // Finalizes auth session if redirected back

export function useGoogleAuth() {
  // Create redirect URI based on platform (mobile uses proxy)
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: Platform.OS !== "web",
  });

  // Google OAuth request configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
    scopes: ["profile", "email"], // Request basic user info
  });

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
