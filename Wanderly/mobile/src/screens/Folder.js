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
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';

// 🔧 Change this to your FastAPI URL if different
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper to get uid from JWT in localStorage
const getUidFromJWT = () => {
  try {
    const token = localStorage.getItem('jwt');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // uid is in `sub`
  } catch (err) {
    console.error('Failed to get uid from JWT:', err);
    return null;
  }
};

const Folder = () => {
  const navigation = useNavigation();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load folders from API (with preview attractions)
  const loadFolders = async () => {
    const uid = getUidFromJWT();
    if (!uid) {
      console.warn('No uid found, user not logged in?');
      setFolders([]);
      return;
    }

    try {
      setLoading(true);

      // 👇 This endpoint should return:
      // { data: [ { folderid, foldername, timecreated, ..., preview_attractions: [ { attid, attname, attpicture }, ... ] } ] }
      const res = await fetch(
        `${API_BASE_URL}/folders-with-preview?uid=${encodeURIComponent(uid)}`
      );

      if (!res.ok) {
        console.error('Failed to load folders:', await res.text());
        return;
      }

      const json = await res.json();
      setFolders(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error('Failed to load folders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadFolders);
    loadFolders();
    return unsubscribe;
  }, [navigation]);

  const handleCreate = () => {
    navigation.navigate('CreateFolder');
  };

  const handleDelete = async (folderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/folder/${folderId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        console.error('Failed to delete folder:', await res.text());
        Alert.alert('Error', 'Failed to delete folder on server.');
        return;
      }

      setFolders((prev) => prev.filter((f) => f.folderid !== folderId));
    } catch (err) {
      console.error('Failed to delete folder:', err);
      Alert.alert('Error', 'Failed to delete folder.');
    }
  };

  const renderFolder = ({ item }) => {
    // Preview attractions come from backend: [{ attid, attname, attpicture }]
    const previews = Array.isArray(item.preview_attractions)
      ? item.preview_attractions.slice(0, 3)
      : [];

    return (
      <View style={styles.folderCard}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('FolderDetail', { folderId: item.folderid })}
        >

          <View style={styles.folderImages}>
            {previews.length > 0 ? (
              previews.map((att, idx) => (
                <Image
                  key={att.attid || idx}
                  source={{ uri: att.attpicture }}
                  style={styles.previewImage}
                />
              ))
            ) : (
              <Text style={{ color: '#777', fontSize: 12 }}>No places yet</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', position: 'absolute', top: 10, right: 10, gap: 8 }}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: '#2196F3' }]}
            onPress={async () => {
              const link = `${window.location.origin}/vote/${item.folderid}`;
              await Clipboard.setStringAsync(link);
              alert('Link copied!');
            }}
          >
            <Text style={{ fontSize: 18, color: '#FFF' }}>🔗</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              const ok = window.confirm('Delete folder? This cannot be undone.');
              if (ok) {
                handleDelete(item.folderid);
              }
            }}
          >
            <Text style={{ fontSize: 20, color: '#FFF' }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text>Loading folders...</Text>
        </View>
      ) : folders.length > 0 ? (
        <FlatList
          data={folders}
          renderItem={renderFolder}
          keyExtractor={(item) => item.folderid}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 60, color: '#CCC' }}>📁</Text>
          <Text style={styles.emptyText}>No folders yet</Text>
        </View>
      )}

      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createText}>Create New</Text>
        <Text style={{ fontSize: 18, color: '#1B1462' }}>➕</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 250,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 28,
    marginBottom: 20,
    color: '#1B1462',
  },
  listContainer: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  folderCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1565C0',
    padding: 16,
    marginBottom: 20,
    position: 'relative',
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  folderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B1462',
  },
  folderImages: {
    flexDirection: 'row',
    marginTop: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 30,
  },
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
    marginBottom: 30,
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1462',
    marginRight: 8,
  },
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
