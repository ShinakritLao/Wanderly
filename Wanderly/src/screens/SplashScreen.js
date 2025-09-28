import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("SignIn"); // ไปหน้า SignIn หลังโหลดเสร็จ
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My App</Text>
      <ActivityIndicator size="large" color="#00b894" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 20, color: "#2d3436" },
});
