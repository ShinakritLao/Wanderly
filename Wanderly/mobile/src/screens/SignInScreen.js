import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { signInWithEmail } from "../services/api";
import GoogleLogin from "./GoogleLogin";

const SignInScreen = ({ navigation }) => {
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await signInWithEmail(email, password);
      await AsyncStorage.setItem("jwt", data.access_token);
      navigation.replace("Dashboard");
    } catch (err) {
      console.error("Sign In Error:", err);
      Alert.alert("Sign In Error", err.message || "Failed to sign in");
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
            Welcome Back
          </Text>

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

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              {loading ? "Signing in..." : "Sign in"}
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

          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.linkText}>
              Don’t have an account?{" "}
              <Text style={styles.signUpText}>Sign up</Text>
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
  signInButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: "#1a73e8",
    fontWeight: "500",
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
  signUpText: {
    color: "#1a73e8",
    fontWeight: "600",
  },
});

export default SignInScreen;
