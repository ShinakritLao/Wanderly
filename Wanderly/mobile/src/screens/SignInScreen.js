import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoogleLogin from "../components/GoogleLogin"; // Google login button/component

export default function SignInScreen({ navigation }) {
  const [checking, setChecking] = React.useState(true); // State to check if JWT exists

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const jwt = await AsyncStorage.getItem("jwt"); // Get JWT from storage
        if (jwt) {
          // If token exists, go directly to Dashboard
          navigation.replace("Dashboard");
          return;
        }
      } catch (err) {
        console.error("Error reading JWT:", err); // Log error if reading fails
      } finally {
        setChecking(false); // Done checking
      }
    };
    checkLogin();
  }, []);

  if (checking) {
    // Show loader while checking for JWT
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>
      <GoogleLogin navigation={navigation} /> {/* Render Google login button */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
});
