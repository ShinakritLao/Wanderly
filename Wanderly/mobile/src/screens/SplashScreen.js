import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const jwt = await AsyncStorage.getItem("jwt"); // Get JWT from local storage
        if (jwt) {
          navigation.replace("Dashboard"); // Token exists → go to Dashboard
        } else {
          navigation.replace("SignIn"); // No token → go to SignIn
        }
      } catch (err) {
        console.error("Error reading JWT:", err); // Log error if reading fails
        navigation.replace("SignIn"); // Fallback to SignIn
      }
    };

    checkLogin(); // Check login status on mount
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4285F4" /> {/* Show loading spinner */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
