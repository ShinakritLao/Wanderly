import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { defaultTransition } from "../services/navigationConfig";

// Screen components
import SplashScreen from "../screens/SplashScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPassword";
import DashboardScreen from "../screens/DashboardScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,      // Hide default header
        ...defaultTransition,    // Apply custom screen transition
      }}
    >
      {/* Initial loading screen */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      {/* Authentication flow */}
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      {/* Main app screen after login */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}
