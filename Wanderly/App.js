import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { FavoritesProvider } from './src/context/FavoritesContext';

export default function App() {
  return (
    <NavigationContainer>
      <FavoritesProvider>
        <AppNavigator />
      </FavoritesProvider>
    </NavigationContainer>
  );
}