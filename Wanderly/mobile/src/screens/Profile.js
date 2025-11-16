import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wanderly-seeo.onrender.com';

const Profile = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState('');

  // Fetch user data from backend on component mount
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

      // Decode JWT to get uid (the token payload contains the user's uid)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const userUid = payload.sub;
      
      setUid(userUid);
      
      // Fetch user data from backend database
      const response = await fetch(`${BACKEND_URL}/users/${userUid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        // Set data from backend database
        setName(userData.name || '');
        setEmail(userData.email || '');
        setProfileImage(userData.picture || 'https://via.placeholder.com/150');
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch user data:', errorData);
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Dynamically import ImagePicker
      const ImagePicker = await import('expo-image-picker');
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const newImageUri = result.assets[0].uri;
        setProfileImage(newImageUri);
        
        // Update profile picture in backend
        await updateProfilePicture(newImageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Please install expo-image-picker: npx expo install expo-image-picker');
    }
  };

  const updateProfilePicture = async (imageUri) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('picture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await fetch(`${BACKEND_URL}/users/${uid}/picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }
      
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const openEditModal = () => {
    setTempName(name);
    setIsEditModalVisible(true);
  };

  const saveChanges = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      
      // Update only the name in backend
      const response = await fetch(`${BACKEND_URL}/users/${uid}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tempName,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setName(updatedUser.name);
        setIsEditModalVisible(false);
        Alert.alert('Success', 'Name updated successfully');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to update name');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    }
  };

  const cancelEdit = () => {
    setIsEditModalVisible(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('jwt');
      navigation.replace('SignIn');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d47a1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.darkBlueSection}
      >
      </LinearGradient>
      <View style={styles.whiteSection}>
        {/* Add your content here */}
      </View>
      
      {/* Circle with image overlapping both sections */}
      <View style={styles.circleContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.circle}>
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
          />
          <View style={styles.cameraIconContainer}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.boldText}>{name || 'User'}</Text>
            <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.normalText}>{email || 'No email'}</Text>
        </View>
        
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🌐</Text>
            <Text style={styles.menuText}>Language</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🎨</Text>
            <Text style={styles.menuText}>Themes & Display</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Notification</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Setting</Text>
          </TouchableOpacity>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelEdit}
      >
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
              <Text style={styles.disabledInputText}>{email || 'No email'}</Text>
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={cancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={saveChanges}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  darkBlueSection: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteSection: {
    flex: 7,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  circleContainer: {
    position: 'absolute',
    left: '46%',
    top: '30%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'flex-start',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0d47a1',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cameraIcon: {
    fontSize: 14,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  boldText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  editButton: {
    marginLeft: 10,
    padding: 5,
  },
  editIcon: {
    fontSize: 18,
  },
  normalText: {
    fontSize: 16,
    color: '#666666',
  },
  menuContainer: {
    width: 250,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333333',
  },
  logoutButton: {
    width: 250,
    backgroundColor: '#0d47a1',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  disabledInputText: {
    fontSize: 16,
    color: '#999999',
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#0d47a1',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile;