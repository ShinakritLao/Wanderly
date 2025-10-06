import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoogleLogin from "./GoogleLogin";
import { signInWithEmail } from "../services/api";

export default function SignInScreen({ navigation }) {
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check JWT when opening the app
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const jwt = await AsyncStorage.getItem("jwt");
        if (jwt) {
          navigation.replace("Dashboard");
          return;
        }
      } catch (err) {
        console.error("Error reading JWT:", err);
      } finally {
        setChecking(false);
      }
    };
    checkLogin();
  }, []);

  // Sign In with Email/Password
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      // Call backend login
      const data = await signInWithEmail(email, password);
      console.log("Sign In Success:", data);

      // Store JWT
      await AsyncStorage.setItem("jwt", data.access_token);

      // Goto Dashboard
      navigation.replace("Dashboard");
    } catch (err) {
      console.error("Sign In Error:", err);
      Alert.alert("Sign In Error", err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // Loader when check JWT
  if (checking) {
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

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title={loading ? "Signing in..." : "Sign In"} onPress={handleSignIn} disabled={loading} />

      <Text style={styles.orText}>or</Text>

      <GoogleLogin navigation={navigation} />

      <Text style={styles.linkText} onPress={() => navigation.navigate("SignUp")}>
        Don’t have an account? Sign up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginVertical: 6 },
  orText: { marginVertical: 15, fontSize: 16, color: "#666" },
  linkText: { marginTop: 20, color: "#4285F4", fontWeight: "600" },
});
