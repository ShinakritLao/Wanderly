import React, { useEffect, useState } from "react";
import {View, Text, TextInput, ActivityIndicator, TouchableOpacity, Image, StyleSheet} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { signUpWithEmail } from "../services/api";
import GoogleLogin from "./GoogleLogin";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SignUpScreen = ({ navigation }) => {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Show error

  const [fontsLoaded] = useFonts({ Poppins_600SemiBold });

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

  const checkEmailExists = async (email) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Supabase check error:", error);
        throw error;
      }

      return !!data;
    } catch (err) {
      console.error("Error checking email:", err);
      throw err;
    }
  };

  const handleSignUp = async () => {
    setErrorMessage(""); 

    if (!name || !email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const nameRegex = /^[A-Za-zก-๙\s]+$/;
    if (!nameRegex.test(name)) {
      setErrorMessage("Name can only contain letters and spaces.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password.length > 72) {
      setErrorMessage("Password too long. Use fewer than 72 characters.");
      return;
    }

    setLoading(true);

    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        setErrorMessage("This email is already registered. Please sign in.");
        setLoading(false);
        return;
      }

      const data = await signUpWithEmail(email, password, name);
      if (!data || !data.access_token) {
        setErrorMessage("Failed to sign up. Please try again.");
        return;
      }

      await AsyncStorage.setItem("jwt", data.access_token);
      navigation.replace("Dashboard");
    } catch (err) {
      console.error("Sign Up Error:", err);
      setErrorMessage("Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#13A1E1", "#135497", "#1B1462"]}
        style={styles.gradientHeader}
      >
        <Image
          source={require("../assets/wanderly-logo-white.png")}
          style={styles.logoImage}
        />
      </LinearGradient>

      <View style={styles.formWrapper}>
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { fontFamily: "Poppins_600SemiBold" }]}>
            Get Started
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          {/* Show error under input */}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? "Creating..." : "Sign up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => {
              if (googleLoginRef?.current) {
                googleLoginRef.current();
              }
            }}
          >
            <Image
              source={require("../assets/google-logo.png")}
              style={styles.googleLogo}
            />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <GoogleLogin
            navigation={navigation}
            refCallback={(callbackFn) => (googleLoginRef.current = callbackFn)}
          />

          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Text style={styles.signInText}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const googleLoginRef = { current: null };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  gradientHeader: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 120,
    height: 120,
    marginTop: 60,
    marginBottom: 20,
  },
  formWrapper: {
    flex: 1,
    marginTop: -30,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  formContainer: {
    padding: 20,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 30,
    color: "#135497",
    textAlign: "center",
    marginBottom: 25,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
  },
  signUpButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  orText: {
    color: "#666",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  googleLogo: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
  linkText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#666",
  },
  signInText: {
    color: "#1a73e8",
    fontWeight: "600",
  },
});

export default SignUpScreen;