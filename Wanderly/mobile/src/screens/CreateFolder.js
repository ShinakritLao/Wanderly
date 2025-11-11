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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFavorites } from "../context/FavoritesContext";

const CreateFolderScreen = () => {
  const { getFavorites } = useFavorites(); // get data directly from context
  const favorites = getFavorites(); // only those with favorite === 1
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
    if (!folderName.trim() || selected.length === 0) return;

    try {
      const storedFolders = await AsyncStorage.getItem("folders");
      const folders = storedFolders ? JSON.parse(storedFolders) : [];

      const newFolder = {
        id: Date.now().toString(),
        name: folderName,
        places: selected,
      };

      await AsyncStorage.setItem("folders", JSON.stringify([...folders, newFolder]));
      navigation.goBack();
    } catch (err) {
      console.log("Error saving folder:", err);
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />
      )}

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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E3192",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemSelected: {
    borderWidth: 2,
    borderColor: "#2E3192",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#2E3192",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#2E3192",
  },
  checkMark: {
    color: "#fff",
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: "#2E3192",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});

export default CreateFolderScreen;
