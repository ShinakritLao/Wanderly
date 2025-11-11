import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const Profile = () => {
  return (
    <react-native-safe-area-context style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your profile and settings</Text>
      </View>
    </react-native-safe-area-context>
  );
};

export default Profile;