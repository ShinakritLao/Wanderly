import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const Folder = () => {
  return (
    <react-native-safe-area-context style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Folder</Text>
        <Text style={styles.subtitle}>Folder your travel</Text>
      </View>
    </react-native-safe-area-context>
  );
};
export default Folder;