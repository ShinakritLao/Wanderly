import React, { useState, useRef } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFavorites } from '../context/FavoritesContext';

const NewPlace = ({ navigation }) => {
  const { addPlace } = useFavorites();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);


  // Validate image URL and set preview
  const handleImageUrl = (url) => {
    if (!url.trim()) {
      setImage('');
      setImagePreview(null);
      return;
    }
    setImage(url);
    setImagePreview(url);
  };

  // Pick image from device storage (native) or file upload (web)
  const pickImageFromDevice = async () => {
    if (Platform.OS === 'web') {
      // Trigger file input click
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access media library is required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setImagePreview(result.assets[0].uri);
    }
  };

  // Handle file upload for web
  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateAndSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Missing field', 'Please enter the name of the place.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Missing field', 'Please enter the location.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing field', 'Please enter the description.');
      return;
    }
    if (!image) {
      Alert.alert('Missing picture', 'Please select an image for the place.');
      return;
    }
    setShowApprovalModal(true);
  };

  const handleApproval = (approved) => {
    setShowApprovalModal(false);
    if (!approved) {
      setTimeout(() => {
        Alert.alert('Denied', 'You have been denied.');
      }, 100);
      return;
    }
    // Add the place and navigate only if approved
    addPlace({
      name: name.trim(),
      location: location.trim(),
      image: image || 'https://via.placeholder.com/400x300?text=No+Image',
      description: description.trim(),
      verified: true,
    });
    // Clear form fields
    setName('');
    setLocation('');
    setImage(null);
    setDescription('');
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoTop}>
        <Image
          source={require('../assets/Wanderly-Color-Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle}>Add New Place</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">

          <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="e.g. Hidden Beach"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          placeholder="City, Country"
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />


        <Text style={styles.label}>Picture</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#4A90E2', marginTop: 0 }]} onPress={pickImageFromDevice}>
            <Text style={styles.buttonText}>Upload from device</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          )}
          <Text style={{ fontWeight: 'bold' }}>or</Text>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Image URL (https://...)"
              style={styles.input}
              value={image}
              onChangeText={handleImageUrl}
              autoCapitalize="none"
            />
          </View>
        </View>
        {imagePreview && (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: imagePreview }} 
              style={styles.imagePreview}
              resizeMode="cover"
              onError={() => {
                Alert.alert('Invalid Image', 'The selected image could not be loaded.');
                setImagePreview(null);
              }}
            />
            <TouchableOpacity 
              style={styles.removeImageButton} 
              onPress={() => {
                setImage('');
                setImagePreview(null);
              }}
            >
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Tell us about this place..."
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

          <TouchableOpacity style={styles.button} onPress={validateAndSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Admin Approval Modal */}
      <Modal
        visible={showApprovalModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admin Approval</Text>
            </View>
            <Text style={styles.modalText}>Did it approve by admin?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.noButton]} 
                onPress={() => handleApproval(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.yesButton]} 
                onPress={() => handleApproval(true)}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
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
    backgroundColor: '#FFFFFF',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  descriptionInput: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B1462',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 100,
  },
  yesButton: {
    backgroundColor: '#4CAF50',
  },
  noButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoTop: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
    marginVertical: 20,
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B1462',
  },
  formContainer: {
    paddingHorizontal: 28,
    paddingVertical: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  logo: {
    width: 250,
    height: 120,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewPlace;