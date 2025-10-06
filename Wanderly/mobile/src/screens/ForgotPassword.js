// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
// import { resetPassword } from '../services/api';

// export default function ForgotPasswordScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleResetPassword = async () => {
//     if (!email || !newPassword || !confirmPassword) {
//       Alert.alert('Missing Info', 'Please fill in all fields');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       Alert.alert('Password Mismatch', 'New passwords do not match');
//       return;
//     }

//     setLoading(true);
//     try {
//       await resetPassword(email, newPassword);
//       Alert.alert(
//         'Success',
//         'Password has been reset successfully',
//         [{ text: 'OK', onPress: () => navigation.goBack() }]
//       );
//     } catch (err) {
//       console.error('Password Reset Error:', err);
//       Alert.alert('Error', err.message || 'Failed to reset password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Reset Password</Text>
//       <Text style={styles.subtitle}>Enter your email and new password</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//         keyboardType="email-address"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="New Password"
//         value={newPassword}
//         onChangeText={setNewPassword}
//         secureTextEntry
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Confirm New Password"
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//         secureTextEntry
//       />

//       {loading ? (
//         <ActivityIndicator size="large" color="#4285F4" />
//       ) : (
//         <Button title="Reset Password" onPress={handleResetPassword} />
//       )}

//       <Text style={styles.backLink} onPress={() => navigation.goBack()}>
//         Back to Sign In
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 20,
//   },
//   input: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 6,
//   },
//   backLink: {
//     marginTop: 20,
//     color: '#4285F4',
//     fontWeight: '600',
//   },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { resetPassword } from "../services/api";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fontsLoaded] = useFonts({ Poppins_600SemiBold });

  const handleResetPassword = async () => {
    if (!email || !newPassword || !confirmPassword) {
      Alert.alert("Missing Info", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, newPassword);
      Alert.alert("Success", "Password has been reset successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Password Reset Error:", err);
      Alert.alert("Error", err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔷 Header Gradient + Logo */}
      <LinearGradient
        colors={["#13A1E1", "#135497", "#1B1462"]}
        style={styles.gradientHeader}
      >
        <Image
          source={require("../assets/wanderly-logo-white.png")}
          style={styles.logoImage}
        />
      </LinearGradient>

      {/* 🔷 Card Form */}
      <View style={styles.formWrapper}>
        <View style={styles.formContainer}>
          <Text style={[styles.formTitle, { fontFamily: "Poppins_600SemiBold" }]}>
            Reset Password
          </Text>
          <Text style={styles.formSubtitle}>
            Enter your email and new password
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

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>
              {loading ? "Resetting..." : "Reset Password"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>
              ← Back to <Text style={styles.signInText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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
    marginBottom: 10,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
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
    fontWeight: "600",
  },
  backLink: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 14,
    color: "#666",
  },
  signInText: {
    color: "#1a73e8",
    fontWeight: "600",
  },
});

