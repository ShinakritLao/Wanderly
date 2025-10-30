import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { sendOtpForSignUp, verifyOtpSignUp } from "../services/api";
import SliderCaptcha from "../screens/SliderCaptcha";

const SignUpScreen = ({ navigation }) => {
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(1); // 1 = input info, 2 = verify OTP
  const [showCaptcha, setShowCaptcha] = useState(false);

  const [fontsLoaded] = useFonts({ Poppins_600SemiBold });

  useEffect(() => {
    // Auto-login if JWT exists
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

  // Validate input and show CAPTCHA before sending OTP
  const handleSignUpPress = () => {
    setErrorMessage("");
    if (!name || !email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    setShowCaptcha(true);
  };

  // After CAPTCHA success, validate fields and send OTP
  const handleCaptchaSuccess = async () => {
    setShowCaptcha(false);
    setErrorMessage("");

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
      await sendOtpForSignUp(email);
      setStep(2);
    } catch (err) {
      console.error("Sign Up Error:", err);
      setErrorMessage("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and finish registration
  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrorMessage("Please enter the OTP sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOtpSignUp(email, otp, password, name);
      if (data?.access_token) {
        await AsyncStorage.setItem("jwt", data.access_token);
        navigation.replace("Dashboard");
      } else {
        setErrorMessage("Sign-up failed. Please try again.");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setErrorMessage(err.message || "Invalid OTP or failed to verify. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking login or loading fonts
  if (checking || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with logo and gradient background */}
      <LinearGradient
        colors={["#13A1E1", "#135497", "#1B1462"]}
        style={styles.gradientHeader}
      >
        <Image
          source={require("../assets/wanderly-logo-white.png")}
          style={styles.logoImage}
        />
      </LinearGradient>

      {/* Sign-up and OTP form */}
      <View style={styles.formWrapper}>
        <View style={styles.formContainer}>
          {step === 1 ? (
            <>
              <Text
                style={[styles.formTitle, { fontFamily: "Poppins_600SemiBold" }]}
              >
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

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUpPress}
                disabled={loading}
              >
                <Text style={styles.signUpButtonText}>
                  {loading ? "Sending OTP..." : "Sign up"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                <Text style={styles.linkText}>
                  Have an account? <Text style={styles.signUpText}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text
                style={[styles.formTitle, { fontFamily: "Poppins_600SemiBold" }]}
              >
                Verify OTP
              </Text>
              <Text style={{ textAlign: "center", marginBottom: 20 }}>
                Enter the OTP sent to your email: {email}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                <Text style={styles.signUpButtonText}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* CAPTCHA popup */}
      {showCaptcha && (
        <View style={styles.captchaOverlay}>
          <View style={styles.captchaContainer}>
            <SliderCaptcha onSuccess={handleCaptchaSuccess} />
            <TouchableOpacity onPress={() => setShowCaptcha(false)}>
              <Text style={styles.closeCaptcha}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  gradientHeader: { 
    height: 200, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  logoImage: { 
    width: 120, 
    height: 120, 
    marginTop: 60, 
    marginBottom: 20 
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
    marginTop: 20 
  },
  formTitle: { 
    fontSize: 30, 
    color: "#135497", 
    textAlign: "center", 
    marginBottom: 25, 
    letterSpacing: 0.5 
  },
  input: { 
    backgroundColor: "#f5f5f5", 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 16, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: "#eee" 
  },
  errorText: { 
    color: "red", 
    marginBottom: 10, 
    fontSize: 14 
  },
  signUpButton: { 
    backgroundColor: "#1a73e8", 
    borderRadius: 12, 
    padding: 16, 
    alignItems: "center", 
    marginTop: 10 
  },
  signUpButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  linkText: { 
    textAlign: "center", 
    marginTop: 20, 
    fontSize: 14, 
    color: "#666" 
  },
  signUpText: { 
    color: "#1a73e8", 
    fontWeight: "600" 
  },
  captchaOverlay: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },
  captchaContainer: { 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    width: "85%", 
    alignItems: "center" 
  },
  closeCaptcha: {
    fontSize: 20,
    color: "#333",
  },
});

export default SignUpScreen;
