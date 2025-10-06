import React, { useEffect } from "react";
import { View, StyleSheet, Image, ActivityIndicator, Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const startAnimation = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => callback && callback());
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const jwt = await AsyncStorage.getItem("jwt");
        setTimeout(() => {
          startAnimation(() => {
            if (jwt) {
              navigation.replace("Dashboard");
            } else {
              navigation.replace("SignIn");
            }
          });
        }, 2000);
      } catch (err) {
        console.error("Error reading JWT:", err);
        navigation.replace("SignIn");
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
          <Image
            source={require('../assets/wanderly-logo-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
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
  },
  logo: {
    width: 360,
    height: 180,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  }
});