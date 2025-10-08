import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";

// Handle OAuth redirect if needed
WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  // Google OAuth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // ✅ Web client ID ต้องตรง
    redirectUri,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      // Pull id_token from response
      const id_token = response.authentication?.idToken || response.params?.id_token;
      if (id_token) {
        console.log("✅ Got Google ID token:", id_token);
      } else {
        console.warn("⚠️ Google response success but no id_token found:", response);
      }
    }
  }, [response]);

  console.log("✅ Redirect URI (used by Google OAuth):", redirectUri);

  return { request, promptAsync, response };
}
