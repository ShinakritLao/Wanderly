import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Alert, Modal} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { requestOtp, verifyOtpAndResetPassword } from "../services/api";
import SliderCaptcha from "../screens/SliderCaptcha"; 

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = request OTP, 2 = verify and reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);

  const [fontsLoaded] = useFonts({ Poppins_600SemiBold });

  // Send OTP request
  const handleRequestOtp = async () => {
    setErrorMessage("");
    if (!email) return setErrorMessage("Please enter your email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setErrorMessage("Please enter a valid email address");

    setLoading(true);
    try {
      await requestOtp(email);
      Alert.alert("OTP sent", "Please check your email for the OTP");
      setStep(2);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Called when CAPTCHA is solved
  const handleCaptchaSuccess = () => {
    setShowCaptcha(false);
    handleRequestOtp();
  };

  // Verify OTP and reset password
  const handleVerifyOtpAndReset = async () => {
    setErrorMessage("");
    if (!otp || !newPassword || !confirmPassword) return setErrorMessage("Please fill in all fields");
    if (newPassword.length < 8) return setErrorMessage("Password must be at least 8 characters long");
    if (newPassword !== confirmPassword) return setErrorMessage("Passwords do not match");

    setLoading(true);
    try {
      await verifyOtpAndResetPassword(email, otp, newPassword);
      Alert.alert("Success", "Password has been reset successfully");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Loading screen while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header section with gradient and logo */}
      <LinearGradient colors={["#13A1E1", "#135497", "#1B1462"]} style={styles.gradientHeader}>
        <Image source={require("../assets/wanderly-logo-white.png")} style={styles.logoImage} />
      </LinearGradient>

      {/* Main form section */}
      <View style={styles.formWrapper}>
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { fontFamily: "Poppins_600SemiBold" }]}>
            {step === 1 ? "Reset Password" : "Verify OTP & Set New Password"}
          </Text>

          {/* Step 1: Email input and OTP request */}
          {step === 1 && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => setShowCaptcha(true)}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: OTP and password reset inputs */}
          {step === 2 && (
            <>
              <TextInput
                style={styles.input}
                placeholder="OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleVerifyOtpAndReset}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Back to sign-in link */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>
              ← Back to <Text style={styles.signInText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CAPTCHA modal overlay */}
      <Modal visible={showCaptcha} transparent animationType="fade">
        <View style={styles.captchaContainer}>
          <View style={styles.captchaBox}>
            <SliderCaptcha onSuccess={handleCaptchaSuccess} />
            <TouchableOpacity onPress={() => setShowCaptcha(false)}>
              <Text style={styles.closeCaptcha}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    marginTop: 20 },
  formTitle: { 
    fontSize: 30, 
    color: "#135497", 
    textAlign: "center", 
    marginBottom: 10 
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
    fontSize: 14 
  },
  resetButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  resetButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  backLink: { 
    textAlign: "center", 
    marginTop: 25, 
    fontSize: 14, 
    color: "#666" 
  },
  signInText: { 
    color: "#1a73e8", 
    fontWeight: "600" 
  },
  captchaContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  captchaBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "85%",
  },
  closeCaptcha: { 
    fontSize: 20, 
    color: "#333" 
  },
});
