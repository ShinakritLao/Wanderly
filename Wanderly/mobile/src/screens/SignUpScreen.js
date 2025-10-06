import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GoogleLogin from "./GoogleLogin";
import { signUpWithEmail } from "../services/api";

export default function SignUpScreen({ navigation }) {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Check JWT token on first load
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

  // Handle email sign up
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please enter both email and password.");
      return;
    }
    if (password.length > 72) {
    Alert.alert("Password too long", "Please use a password shorter than 72 characters.");
      return;
}

    setLoading(true);
    try {
      // Call backend API to register user
      const data = await signUpWithEmail(email, password, name);

      // Save JWT to AsyncStorage
      await AsyncStorage.setItem("jwt", data.access_token);

      // Navigate to dashboard
      navigation.replace("Dashboard");
    } catch (err) {
      console.error("Sign Up Error:", err);
      Alert.alert("Sign Up Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loader while checking JWT
  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account 👋</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
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

      <Button title={loading ? "Creating..." : "Sign Up"} onPress={handleSignUp} disabled={loading} />

      <Text style={styles.orText}>or</Text>

      <GoogleLogin navigation={navigation} />

      <Text style={styles.linkText} onPress={() => navigation.navigate("SignIn")}>
        Already have an account? Sign in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
  },
  orText: {
    marginVertical: 15,
    fontSize: 16,
    color: "#666",
  },
  linkText: {
    marginTop: 20,
    color: "#4285F4",
    fontWeight: "600",
  },
});
