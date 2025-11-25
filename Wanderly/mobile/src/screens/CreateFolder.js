// CreateFolder.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFavorites } from "../context/FavoritesContext";

const CreateFolderScreen = () => {
  const { getFavorites } = useFavorites();
  const favorites = getFavorites();
  const [selected, setSelected] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [duration, setDuration] = useState("5"); // default 5 days
  const navigation = useNavigation();

  const toggleSelect = (place) => {
    if (selected.some((p) => p.id === place.id)) {
      setSelected(selected.filter((p) => p.id !== place.id));
    } else {
      setSelected([...selected, place]);
    }
  };

  const handleSubmit = async () => {
    if (!folderName.trim()) {
      Alert.alert("Please enter a folder name");
      return;
    }
    if (selected.length === 0) {
      Alert.alert("Please select at least one place");
      return;
    }
    const days = parseInt(duration, 10);
    if (isNaN(days) || days < 1 || days > 30) {
      Alert.alert("Please enter a valid duration (1-30 days)");
      return;
    }

    try {
      const storedFolders = await AsyncStorage.getItem("folders");
      const folders = storedFolders ? JSON.parse(storedFolders) : [];

      // initialize vote counts for each place to 0
      const votes = {};
      selected.forEach((p) => (votes[p.id] = 0));

      // set endDate = custom days after creation
      const createdAt = new Date();
      const endDate = new Date(createdAt);
      endDate.setDate(createdAt.getDate() + days);

      const newFolder = {
        id: Date.now().toString(),
        name: folderName.trim(),
        places: selected,
        createdAt: createdAt.toISOString(),
        endDate: endDate.toISOString(),
        votes,
      };

      await AsyncStorage.setItem("folders", JSON.stringify([...folders, newFolder]));
      navigation.goBack();
    } catch (err) {
      console.log("Error saving folder:", err);
      Alert.alert("Error", "Something went wrong saving the folder.");
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selected.some((p) => p.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.itemSelected]}
        onPress={() => toggleSelect(item)}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
          {isSelected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeBtnText}>×</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Folder</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter folder name"
          value={folderName}
          onChangeText={setFolderName}
        />
        <Text style={styles.label}>Vote duration (days):</Text>
        <TextInput
          style={styles.input}
          placeholder="5"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          maxLength={2}
        />
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorites available.</Text>
            <Text style={styles.emptySubtext}>
              Add places to favorites first before creating a folder.
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            style={styles.list}
          />
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.submitBtn,
          (!folderName.trim() || selected.length === 0) && { opacity: 0.5 },
        ]}
        disabled={!folderName.trim() || selected.length === 0}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Save Folder</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeBtnText: {
    fontSize: 26,
    color: '#1565C0',
    fontWeight: 'bold',
    lineHeight: 30,
    marginTop: -2,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 28,
    paddingTop: 10,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
  list: {
    flex: 1,
    overflow: "auto",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E3192",
    marginTop: 30,
    marginBottom: 15,
    marginLeft: 0,
  },
  label: {
    fontSize: 15,
    color: "#2E3192",
    marginLeft: 0,
    marginBottom: 4,
    fontWeight: "500"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    marginLeft: 0,
    marginRight: 0,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 0,
    marginRight: 0,
  },
  itemSelected: { borderWidth: 2, borderColor: "#2E3192" },
  image: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
  name: { flex: 1, fontSize: 16, fontWeight: "500" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#2E3192",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  checkedBox: { backgroundColor: "#2E3192" },
  checkMark: { color: "#fff", fontSize: 16 },
  submitBtn: {
    backgroundColor: "#2E3192",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    marginLeft: 0,
    marginRight: 0,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: { color: "#aaa", fontSize: 16, fontWeight: "600" },
  emptySubtext: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});  

export default CreateFolderScreen;