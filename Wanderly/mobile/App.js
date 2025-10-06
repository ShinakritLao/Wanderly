import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import SplashScreen from "./src/screens/SplashScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import ForgotPasswordScreen from './src/screens/ForgotPassword';
import DashboardScreen from "./src/screens/DashboardScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          // เพิ่ม animation config สำหรับเฟดเอฟเฟค
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        {/* First screen shown on app launch */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* Sign in screen */}
        <Stack.Screen name="SignIn" component={SignInScreen} />

        {/* Forget Password */}
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Sign up screen */}
        <Stack.Screen name="SignUp" component={SignUpScreen} />

        {/* Main dashboard after login */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
