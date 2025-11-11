import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, TouchableOpacity, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoogleAuth } from "../services/googleConfig";
import { signInWithGoogle } from "../services/api";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function GoogleLogin({ navigation, refCallback }) {
  const { request, promptAsync, response, redirectUri } = useGoogleAuth();
  const [loading, setLoading] = useState(false);

  // Allow parent to trigger Google login
  useEffect(() => {
    if (refCallback) refCallback(() => promptAsync());
  }, [refCallback, promptAsync]);

  // Handle Google login response
  useEffect(() => {
    const handleLogin = async () => {
      if (response?.type === "success") {
        try {
          setLoading(true);
          let credential;

          // Choose token type based on platform
          if (Platform.OS === "web") {
            const accessToken = response.authentication?.accessToken;
            if (!accessToken) throw new Error("Missing access token (web)");
            credential = GoogleAuthProvider.credential(null, accessToken);
          } else {
            const idToken = response.authentication?.idToken;
            if (!idToken) throw new Error("Missing ID token (mobile)");
            credential = GoogleAuthProvider.credential(idToken);
          }

          // Sign in with Firebase
          const firebaseUser = await signInWithCredential(auth, credential);
          const firebaseToken = await firebaseUser.user.getIdToken();

          // Send Firebase token to backend to get JWT
          const data = await signInWithGoogle(firebaseToken);
          await AsyncStorage.setItem("jwt", data.access_token);

          navigation.replace("MainTabs");
        } catch (err) {
          console.error("Google login error:", err);
          Alert.alert("Login failed", "Could not log in with Google.");
        } finally {
          setLoading(false);
        }
      }
    };
    handleLogin();
  }, [response]);

  // Hidden button triggers Google login silently
  return (
    <View style={{ marginVertical: 0 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#4285F4" />
      ) : (
        <TouchableOpacity
          disabled={!request || loading}
          onPress={() => promptAsync()}
          style={{ width: 1, height: 1, opacity: 0 }}
        />
      )}
    </View>
  );
}
