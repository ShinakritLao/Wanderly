import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
// import { makeRedirectUri } from "expo-auth-session";
import { useEffect } from "react";

// Use makeRedirectUri as Expo's universal redirect URI.
WebBrowser.maybeCompleteAuthSession(); // Handle OAuth redirect if needed

export function useGoogleAuth() {
  const redirectUri = 'https://auth.expo.io/@shinakritlao/wanderly';
  // const redirectUri = 'https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_PROJECT_SLUG';
  // const redirectUri = 'https://auth.expo.io/@YOUR_EXPO_USERNAME/wanderly';

  const [request, response, promptAsync] = Google.useAuthRequest({
    // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri, 
    scopes: ["profile", "email"], // Request user profile + email
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

  // console.log("✅ Redirect URI:", redirectUri);
  // console.log("✅ Web Client ID:", process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  return { request, promptAsync, response };
}
