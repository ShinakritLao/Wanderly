import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const Favorites = () => {
  return (
    <react-native-safe-area-context style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>Your favorite places will appear here</Text>
      </View>
    </react-native-safe-area-context>
  );
};

export default Favorites;