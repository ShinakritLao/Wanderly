import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, ActivityIndicator, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const fadeAnim = React.useRef(new Animated.Value(1)).current; // Animation value for fade-out

  // Fade-out animation
  const startAnimation = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start(() => callback && callback());
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const jwt = await AsyncStorage.getItem("jwt"); // Check if user is logged in

        // Show splash screen for 1.5s, then navigate
        setTimeout(() => {
          startAnimation(() => {
            if (jwt) {
              navigation.replace("MainTabs"); // Navigate to Home if logged in
            } else {
              navigation.replace("SignIn");   // Otherwise, go to sign-in
            }
          });
        }, 1500);
      } catch (err) {
        console.error("Error reading JWT:", err);
        navigation.replace("SignIn"); // Fallback to sign-in on error
      }
    };
    checkLogin();
  }, []);

  return (
    <Animated.View style={[styles.animContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#13A1E1', '#1B1462']}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          {/* App logo */}
          <Image
            source={require('../assets/wanderly-logo-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          {/* Loading spinner */}
          <ActivityIndicator 
            size="large" 
            color="#FFFFFF" 
            style={styles.loader}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animContainer: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
  },
  logo: {
    width: 360,
    height: 180,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
});
