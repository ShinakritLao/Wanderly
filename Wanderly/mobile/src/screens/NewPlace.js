import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Image, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFavorites } from '../context/FavoritesContext';
import { SUPABASE_URL, SUPABASE_KEY } from '@env';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const NewPlace = ({ navigation }) => {
  const { addPlace } = useFavorites();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // NEW: multi-select states
  const [categories, setCategories] = useState([]);
  const [environments, setEnvironments] = useState([]);

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

const pickImageFromDevice = async () => {
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
if (status !== 'granted') {
Alert.alert('Permission denied', 'Permission to access media library is required!');
return;
}
const result = await ImagePicker.launchImageLibraryAsync({
mediaTypes: ImagePicker.MediaTypeOptions.Images,
allowsEditing: true,
aspect: [4, 3],
quality: 1,
});
if (!result.canceled && result.assets?.length > 0) {
setImage(result.assets[0].uri);
setImagePreview(result.assets[0].uri);
}
};


  const validateAndSubmit = async () => {
    if (!name.trim() || !location.trim() || !description.trim() || !image || !price.trim()) {
      Alert.alert('Missing field', 'Please fill out all fields and select an image.');
      return;
    }
    if (categories.length === 0 || environments.length === 0) {
      Alert.alert('Missing selection', 'Please select at least one category and environment.');
      return;
    }
    setShowApprovalModal(true);
  };

  const handleApproval = async (approved) => {
    setShowApprovalModal(false);
    if (!approved) {
      setTimeout(() => Alert.alert('Denied', 'You have been denied.'), 100);
      return;
    }

    try {
      const filename = `${Date.now()}_${name.replace(/\s/g, '_')}.jpg`;
      const response = await fetch(image);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('Attraction Pictures')
        .upload(filename, blob, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error('Supabase upload error:', error);
        Alert.alert('Upload failed', 'Failed to upload image to Supabase.');
        return;
      }

      const publicUrl = supabase.storage.from('Attraction Pictures').getPublicUrl(filename).data.publicUrl;
      
      const res = await fetch("https://wanderly-seeo.onrender.com/attraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attpicture: publicUrl,
          name: name.trim(),
          location: location.trim(),
          description: description.trim(),
          category: categories,
          price: parseFloat(price),
          environment: environments,
        }),
      });

      const result = await res.json();
      console.log("Backend response:", result);

      // reset
      setName('');
      setLocation('');
      setImage(null);
      setImagePreview(null);
      setDescription('');
      setPrice('');
      setCategories([]);
      setEnvironments([]);
      navigation.navigate('Home');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong during upload.');
    }
  };

return (
<SafeAreaView style={styles.container}>
<View style={styles.logoTop}>
<Image source={require('../assets/Wanderly-Color-Logo.png')} style={styles.logo} resizeMode="contain" />
</View>
  <View style={styles.titleContainer}>
    <Text style={styles.headerTitle}>Add New Place</Text>
  </View>

  <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
    <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Name</Text>
      <TextInput placeholder="e.g. Hidden Beach" style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Location</Text>
      <TextInput placeholder="City, Country" style={styles.input} value={location} onChangeText={setLocation} />

      {/* Category Selection */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.selectionRow}>
        {['Historical & Cultural', 'Nature & Outdoors', 'Beaches & Islands', 'Food & Dining', 'Shopping', 'Entertainment & Nightlife', 'Adventure & Sports', 'Wellness & Relaxation', 'Arts & Events', 'Family & Kids'].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.optionButton,
              categories.includes(cat) && styles.optionSelected
            ]}
            onPress={() => toggleSelection(cat, categories, setCategories)}
          >
            <Text style={styles.optionText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Environment Selection */}
      <Text style={styles.label}>Environment</Text>
      <View style={styles.selectionRow}>
        {['Urban', 'Suburban', 'Rural', 'Beach', 'Mountain', 'Forest', 'Desert', 'Lake/Riverside', 'Island', 'Urban Nature Mix'].map(env => (
          <TouchableOpacity
            key={env}
            style={[
              styles.optionButton,
              environments.includes(env) && styles.optionSelected
            ]}
            onPress={() => toggleSelection(env, environments, setEnvironments)}
          >
            <Text style={styles.optionText}>{env}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Price (฿)</Text>
      <TextInput
        placeholder="e.g. 150"
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Picture</Text>
      <TouchableOpacity style={[styles.button, { marginTop: 0 }]} onPress={pickImageFromDevice}>
        <Text style={styles.buttonText}>Upload Image from Device</Text>
      </TouchableOpacity>

      {imagePreview && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imagePreview }} style={styles.imagePreview} resizeMode="cover" onError={() => setImagePreview(null)} />
          <TouchableOpacity style={styles.removeImageButton} onPress={() => { setImage(''); setImagePreview(null); }}>
            <Text style={styles.removeImageText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Description</Text>
      <TextInput placeholder="Tell us about this place..." style={[styles.input, styles.descriptionInput]} value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" />

      <TouchableOpacity style={styles.button} onPress={validateAndSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>

  <Modal visible={showApprovalModal} transparent={true} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Admin Approval</Text>
        </View>
        <Text style={styles.modalText}>Did it approve by admin?</Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity style={[styles.modalButton, styles.noButton]} onPress={() => handleApproval(false)}>
            <Text style={styles.modalButtonText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalButton, styles.yesButton]} onPress={() => handleApproval(true)}>
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
container: { flex: 1, backgroundColor: '#FFFFFF' },
descriptionInput: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
imagePreviewContainer: { marginTop: 12, borderRadius: 8, overflow: 'hidden' },
imagePreview: { width: '100%', height: 200, borderRadius: 8 },
removeImageButton: { backgroundColor: '#F44336', paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
removeImageText: { color: '#fff', fontSize: 14, fontWeight: '600' },
modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
modalContent: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, width: '80%', alignItems: 'center' },
modalHeader: { width: '100%', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 20 },
modalTitle: { fontSize: 20, fontWeight: '600', color: '#1B1462', textAlign: 'center' },
modalText: { fontSize: 16, color: '#333', marginBottom: 20, textAlign: 'center' },
modalButtons: { flexDirection: 'row', justifyContent: 'center', gap: 15 },
modalButton: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8, minWidth: 100 },
yesButton: { backgroundColor: '#4CAF50' },
noButton: { backgroundColor: '#F44336' },
modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
logoTop: { alignItems: 'center', paddingTop: 12, paddingBottom: 6 },
titleContainer: { alignItems: 'center', paddingBottom: 6 },
headerTitle: { fontSize: 28, fontWeight: '700', color: '#1B1462' },
formContainer: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
label: { fontSize: 14, color: '#333', marginTop: 12, marginBottom: 6, fontWeight: '600' },
input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, backgroundColor: '#fafafa' },
logo: { width: 250, height: 120 },
button: { marginTop: 24, backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
selectionRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
  marginBottom: 12,
},
optionButton: {
  borderWidth: 1,
  borderColor: '#007AFF',
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 16,
  marginRight: 8,
  backgroundColor: '#fff',
},
optionSelected: {
  backgroundColor: '#007AFF',
},
optionText: {
  color: '#333',
  fontWeight: '600',
},

});

export default NewPlace;