import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { FavoritesProvider } from "./src/context/FavoritesContext"; // Add this import

export default function App() {
  return (
    // Wrap with FavoritesProvider to make context available throughout the app
    <FavoritesProvider>
      {/* Main navigation provider for the entire app */}
      <NavigationContainer>
        {/* Handles all screens and navigation logic */}
        <AppNavigator />
      </NavigationContainer>
    </FavoritesProvider>
  );
}