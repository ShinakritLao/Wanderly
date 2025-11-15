import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFavorites } from '../context/FavoritesContext';

const NewPlace = ({ navigation }) => {
  const { addPlace } = useFavorites();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Pick image from device
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerText}>
            {image ? '✓ Image Selected' : '+ Pick Image from Device'}
          </Text>
        </TouchableOpacity>
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: image }} 
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton} 
              onPress={() => setImage(null)}
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
  },
  descriptionInput: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
  },
  imagePickerText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
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
    padding: 20,
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
