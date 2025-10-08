import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoogleAuth } from "../services/googleConfig";
import { signInWithGoogle } from "../services/api";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function GoogleLogin({ navigation, refCallback }) {
  const { request, promptAsync, response } = useGoogleAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (refCallback) refCallback(() => promptAsync());
  }, [refCallback, promptAsync]);

  useEffect(() => {
    const handleLogin = async () => {
      if (response?.type === "success") {
        try {
          setLoading(true);

          // Extract Google ID Token from response
          const idToken =
            response?.authentication?.idToken || response?.params?.id_token;

          if (!idToken) throw new Error("No ID token found from Google");

          // Convert this token to Firebase for verification.
          const credential = GoogleAuthProvider.credential(idToken);

          // Login to Firebase
          const firebaseUser = await signInWithCredential(auth, credential);

          // Request a real Firebase ID Token
          const firebaseToken = await firebaseUser.user.getIdToken();

          // Send this token to the backend to verify and issue a JWT.
          const data = await signInWithGoogle(firebaseToken);

          // Store backend JWT
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
