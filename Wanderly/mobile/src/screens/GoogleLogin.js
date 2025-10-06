import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoogleAuth } from "../services/googleConfig";
import { signInWithGoogle } from "../services/api";

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
          const idToken = response.params.id_token;
          console.log("✅ Google ID Token:", idToken);
          const data = await signInWithGoogle(idToken);
          await AsyncStorage.setItem("jwt", data.jwt);
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
