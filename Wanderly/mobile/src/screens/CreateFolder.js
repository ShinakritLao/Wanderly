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

    try {
      const storedFolders = await AsyncStorage.getItem("folders");
      const folders = storedFolders ? JSON.parse(storedFolders) : [];

      // initialize vote counts for each place to 0
      const votes = {};
      selected.forEach((p) => (votes[p.id] = 0));

      // automatically set endDate = 5 days after creation
      const createdAt = new Date();
      const endDate = new Date(createdAt);
      endDate.setDate(createdAt.getDate() + 5);

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
      <View style={styles.content}>
        <Text style={styles.title}>Create New Folder</Text>
  
        <TextInput
          style={styles.input}
          placeholder="Enter folder name"
          value={folderName}
          onChangeText={setFolderName}
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
            style={styles.list} // 👈 add this
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
    container: {
      flex: 1,
      backgroundColor: "#fff",
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    content: {
      flex: 1,
      overflow: "auto", // 👈 allows scrolling on web
    },
    list: {
      flex: 1,
      overflow: "auto", // 👈 ensures scroll on both platforms
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
      marginLeft: 20
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 10,
      padding: 10,
      marginBottom: 40,
      marginLeft: 20,
      marginRight: 20
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F5F5F5",
      padding: 10,
      borderRadius: 10,
      marginBottom: 10,
      marginLeft: 30,
      marginRight: 30
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
      marginLeft: 30
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
      marginLeft: 20,
      marginRight: 20
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
