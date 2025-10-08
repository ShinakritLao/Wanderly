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

  // Allow the parent component to call promptAsync.
  useEffect(() => {
    if (refCallback) refCallback(() => promptAsync());
  }, [refCallback, promptAsync]);

  // Log redirectUri
  useEffect(() => {
    // console.log("🌐 Platform:", Platform.OS);
    // console.log("🔹 Google OAuth redirectUri being used:", redirectUri);
  }, [redirectUri]);

  useEffect(() => {
    const handleLogin = async () => {
      if (response?.type === "success") {
        try {
          setLoading(true);

          let credential;
          if (Platform.OS === "web") {
            // On the web, use accessToken instead of idToken.
            const accessToken = response.authentication?.accessToken;
            console.log("🔹 Web accessToken:", accessToken);
            if (!accessToken) throw new Error("No access token found from Google (web)");
            credential = GoogleAuthProvider.credential(null, accessToken);
          } else {
            // On mobile, use idToken.
            const idToken = response.authentication?.idToken;
            console.log("🔹 Mobile idToken:", idToken);
            if (!idToken) throw new Error("No ID token found from Google (mobile)");
            credential = GoogleAuthProvider.credential(idToken);
          }

          // Login to Firebase
          const firebaseUser = await signInWithCredential(auth, credential);
          const firebaseToken = await firebaseUser.user.getIdToken();

          console.log("✅ Firebase ID token:", firebaseToken);

          // Send token to backend to receive JWT
          const data = await signInWithGoogle(firebaseToken);
          await AsyncStorage.setItem("jwt", data.access_token);

          navigation.replace("Dashboard");
        } catch (err) {
          console.error("❌ Google login error:", err);
          Alert.alert("Login failed", "Could not log in with Google.");
        } finally {
          setLoading(false);
        }
      }
    };
    handleLogin();
  }, [response]);

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
