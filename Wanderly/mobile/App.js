import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    // Main navigation provider for the entire app
    <NavigationContainer>
      {/* Handles all screens and navigation logic */}
      <AppNavigator />
    </NavigationContainer>
  );
}
