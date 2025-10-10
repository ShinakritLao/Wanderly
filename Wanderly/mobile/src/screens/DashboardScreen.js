import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchDashboard } from "../services/api";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);  // User data
  const [loading, setLoading] = useState(true); // Loading state

  // User data loading function
  const load = async () => {
    setLoading(true);
    try {
      const jwt = await AsyncStorage.getItem("jwt"); // Read JWT from AsyncStorage
      if (!jwt) {
        navigation.replace("SignIn"); // If there is no token -> Return to the SignIn page.
        return;
      }

      // Fetch data from the backend with JWT
      const res = await fetchDashboard(jwt);
      setUser(res.user);
    } catch (e) {
      console.warn("Error fetching dashboard:", e);
      Alert.alert("Session expired", "Please sign in again.");
      await AsyncStorage.removeItem("jwt");
      navigation.replace("SignIn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // Load data when the Dashboard page is opened
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);                  // leave from Firebase
      await AsyncStorage.removeItem("jwt"); // delete JWT
      navigation.replace("SignIn");         // goback SignIn
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show page while loading data
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={{ marginTop: 10 }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {user ? (
        <>
          <Text style={styles.info}>Email: {user.email}</Text>
          <Text style={styles.info}>UID: {user.uid}</Text>
          <Text style={styles.info}>Name: {user.name ?? "-"}</Text>
        </>
      ) : (
        <Text>No user data found.</Text>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Refresh" onPress={load} />
      </View>

      <View style={{ marginTop: 10 }}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  info: {
    fontSize: 16,
    color: "#555",
    marginVertical: 2,
  },
});
  