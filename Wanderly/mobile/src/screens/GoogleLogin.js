import React, { useEffect } from "react";
import { View, Button, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoogleAuth } from "../services/googleConfig"; // Custom hook for Google OAuth
import { signInWithGoogle } from "../services/api";        // Backend API to exchange idToken for JWT

export default function GoogleLogin({ navigation }) {
  const { request, promptAsync, response } = useGoogleAuth(); // Google OAuth request/response
  const [loading, setLoading] = React.useState(false);       // Loading state during login

  useEffect(() => {
    const handleLogin = async () => {
      if (response?.type === "success") {
        try {
          setLoading(true);                       // Start loading indicator
          const idToken = response.params.id_token; 
          console.log("✅ Google ID Token:", id_token);
          const data = await signInWithGoogle(idToken); // Send idToken to backend to get JWT
          await AsyncStorage.setItem("jwt", data.jwt);  // Store JWT locally
          navigation.replace("Dashboard");        // Navigate to dashboard
        } catch (err) {
          console.error(err);
          Alert.alert("Login failed", "Could not log in with Google."); // Show error alert
        } finally {
          setLoading(false);                      // Stop loading indicator
        }
      }
    };
    handleLogin(); // Run login handler whenever response changes
  }, [response]);

  return (
    <View style={{ marginVertical: 10 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#4285F4" /> // Show spinner while logging in
      ) : (
        <Button
          title="Sign in with Google"
          color="#4285F4"
          disabled={!request}      // Disable button if request not ready
          onPress={() => promptAsync()} // Trigger Google login prompt
          // onPress={() => promptAsync({ useProxy: true })}
        />
      )}
    </View>
  );
}
