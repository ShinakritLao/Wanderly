import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchDashboard } from "../services/api";   // API call to backend
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";  // Firebase instance

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null); // User state

  useEffect(() => {
    const load = async () => {
      const jwt = await AsyncStorage.getItem("jwt"); // Get JWT from storage
      if (!jwt) { 
        navigation.replace("SignIn"); // Redirect if no token
        return; 
      }
      try {
        const res = await fetchDashboard(jwt); // Fetch user data
        setUser(res.user);
      } catch (e) {
        console.warn(e);
        navigation.replace("SignIn"); // Redirect if token invalid
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);                  // Firebase sign out
    await AsyncStorage.removeItem("jwt"); // Clear JWT
    navigation.replace("SignIn");         // Redirect to login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {user ? (
        <>
          <Text>Email: {user.email}</Text>
          <Text>UID: {user.uid}</Text>
          <Text>Name: {user.name ?? "-"}</Text>
        </>
      ) : (
        <Text>Loading...</Text>
      )}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: {flex:1,justifyContent:'center',alignItems:'center'}, 
  title: {fontSize:28,fontWeight:'600', marginBottom:10} 
});
