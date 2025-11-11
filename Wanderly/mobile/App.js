import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { FavoritesProvider } from "./src/context/FavoritesContext"; // Add this import

const linking = {
  prefixes: ["https://wanderly.com", "wanderly://"],
  config: {
    screens: {
      FolderDetail: "folder/:folderId",
      Voting: "vote/:folderId",
    },
  },
};

export default function App() {
  return (
    // Wrap with FavoritesProvider to make context available throughout the app
    <FavoritesProvider>
      {/* Main navigation provider for the entire app */}
      <NavigationContainer linking={linking}>
        {/* Handles all screens and navigation logic */}
        <AppNavigator />
      </NavigationContainer>
    </FavoritesProvider>
  );
}