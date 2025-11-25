import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;

const Profile = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwt');

      if (!token) {
        navigation.replace('SignIn');
        return;
      }

      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const userUid = payload.sub;
      setUid(userUid);

      const response = await fetch(`${BACKEND_URL}/users/${userUid}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setName(userData.name || '');
        setEmail(userData.email || '');
        setProfileImage(userData.picture || 'https://via.placeholder.com/150');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('jwt');
      navigation.replace('SignIn');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout.');
    }
  };

  // -----------------------
  // UI
  // -----------------------

  if (loading) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator size="large" color="#0d47a1" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* BLUE HEADER */}
        <LinearGradient
          colors={['#1a237e', '#0d47a1', '#01579b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        />

        {/* PROFILE IMAGE BLOCK */}
        <View style={styles.imageWrapper}>
          <TouchableOpacity style={styles.imageCircle}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <View style={styles.cameraIconContainer}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* NAME + EMAIL */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name || 'User'}</Text>
            <TouchableOpacity onPress={() => setIsEditModalVisible(true)}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.email}>{email || 'No email'}</Text>
        </View>

        {/* MENU LIST */}
        <View style={styles.card}>
          {[
            { icon: '🌐', title: 'Language' },
            { icon: '🎨', title: 'Themes & Display' },
            { icon: '🔔', title: 'Notification' },
            { icon: '⚙️', title: 'Settings' },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your name"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.disabledInput}>
              <Text>{email}</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  scrollContent: {
    alignItems: 'center',
    paddingBottom: 50,
  },

  header: {
    width: '100%',
    height: 180,
  },

  imageWrapper: {
    marginTop: -55,
    alignItems: 'center',
    width: '100%',
  },

  imageCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  cameraIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0d47a1',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  infoContainer: {
    marginTop: 10,
    alignItems: 'center',
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  email: {
    marginTop: 4,
    fontSize: 15,
    color: '#666',
  },

  editIcon: {
    marginLeft: 8,
    fontSize: 18,
  },

  card: {
    width: '85%',
    maxWidth: 380,
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    padding: 12,
    marginTop: 20,
  },

  menuItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
  },

  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  menuText: {
    fontSize: 16,
  },

  logoutButton: {
    marginTop: 18,
    width: '85%',
    maxWidth: 380,
    backgroundColor: '#0d47a1',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },

  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // ---- MODAL ----
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  inputLabel: { marginTop: 10, color: '#777' },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },

  disabledInput: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },

  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },

  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButton: { backgroundColor: '#eee', marginRight: 8 },
  saveButton: { backgroundColor: '#0d47a1', marginLeft: 8 },

  cancelText: { color: '#555' },
  saveText: { color: '#fff' },

  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
