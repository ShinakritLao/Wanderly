// src/screens/Folder.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Folder = () => {
  const navigation = useNavigation();
  const [folders, setFolders] = useState([]);

  // Load folders from AsyncStorage
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const data = await AsyncStorage.getItem('folders');
        if (data) {
          setFolders(JSON.parse(data));
        }
      } catch (err) {
        console.error('Failed to load folders:', err);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadFolders);
    loadFolders();

    return unsubscribe;
  }, [navigation]);

  const handleCreate = () => {
    navigation.navigate('CreateFolder');
  };

  const handleDelete = async (folderId) => {
    try {
      const updatedFolders = folders.filter(f => f.id !== folderId);
      await AsyncStorage.setItem('folders', JSON.stringify(updatedFolders));
      setFolders(updatedFolders);
    } catch (err) {
      console.error('Failed to delete folder:', err);
    }
  };

  const renderFolder = ({ item }) => (
    <View style={styles.folderCard}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => navigation.navigate('FolderDetail', { folderId: item.id })}
      >
        <View style={styles.folderHeader}>
          <Text style={styles.folderTitle}>{item.name}</Text>
        </View>
        <View style={styles.folderImages}>
          {item.places.slice(0, 3).map((place, idx) => (
            <Image key={idx} source={{ uri: place.image }} style={styles.previewImage} />
          ))}
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', position: 'absolute', top: 10, right: 10, gap: 8 }}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: '#2196F3' }]}
          onPress={async () => {
            const link = `https://wanderly-public.netlify.app/public/folder/${item.id}`;
            await Clipboard.setStringAsync(link);
            if (Platform.OS === 'web') {
              alert('Link copied!');
            } else {
              Alert.alert('Link copied!', 'You can now share this folder link.');
            }
          }}
        >
          <Text style={{ fontSize: 18, color: '#FFF' }}>{Platform.OS === 'web' ? '🔗' : '🔗'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={{ fontSize: 20, color: '#FFF' }}>{Platform.OS === 'web' ? '🗑️' : '🗑️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/Wanderly-Color-Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>
        <Text style={{ color: '#1B1462' }}>Your </Text>
        <Text style={{ color: '#2196F3' }}>plan</Text>
      </Text>

      {folders.length > 0 ? (
        <FlatList
          data={folders}
          renderItem={renderFolder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 60, color: '#CCC' }}>{Platform.OS === 'web' ? '📁' : '📁'}</Text>
          <Text style={styles.emptyText}>No folders yet</Text>
        </View>
      )}

      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createText}>Create New</Text>
        <View style={styles.plusCircle}>
          <Text style={{ fontSize: 18, color: '#1B1462' }}>{Platform.OS === 'web' ? '➕' : '➕'}</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  logoContainer: { alignItems: 'center', marginBottom: 10 },
  logo: { width: 250, height: 120 },
  title: { fontSize: 28, fontWeight: '700', paddingHorizontal: 25, marginBottom: 20 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  folderCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1565C0',
    padding: 16,
    marginBottom: 20,
    position: 'relative',
  },
  folderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  folderTitle: { fontSize: 18, fontWeight: '700', color: '#1B1462' },
  folderImages: { flexDirection: 'row', marginTop: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 40, marginRight: 10 },
  iconButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 6,
    marginLeft: 0,
  },
  deleteButton: {
    backgroundColor: '#E53935',
    borderRadius: 20,
    padding: 6,
    marginLeft: 0,
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, marginBottom: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 10, marginBottom: 30 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#1B1462',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginBottom: 30
  },
  createText: { fontSize: 16, fontWeight: '600', color: '#1B1462', marginRight: 8 },
  plusCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#1B1462',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Folder;
