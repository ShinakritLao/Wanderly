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
import { useNavigation } from "@react-navigation/native";
import { useFavorites } from "../context/FavoritesContext";

// 👉 Change this to your real backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Helper to get uid from JWT stored in localStorage
const getUidFromJWT = () => {
  try {
    const token = localStorage.getItem("jwt"); // get JWT from localStorage
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub; // uid is in `sub`
  } catch (err) {
    console.error("Failed to get uid from JWT:", err);
    return null;
  }
};

const CreateFolderScreen = () => {
  const { getFavorites } = useFavorites();
  const favorites = getFavorites();
  const [selected, setSelected] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [duration, setDuration] = useState("5"); // default 5 days
  const [isSaving, setIsSaving] = useState(false);
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

    const uid = getUidFromJWT();
    if (!uid) {
      Alert.alert("Not logged in", "Please sign in again to create a folder.");
      return;
    }

    try {
      setIsSaving(true);

      const createdAt = new Date();
      const endDate = new Date(createdAt);
      endDate.setDate(createdAt.getDate() + days);

      // 🚫 DON'T send folderid (DB generates it)
      const folderPayload = {
        foldername: folderName.trim(),
        uid: uid,
        timecreated: createdAt.toISOString(),
        timeclosed: endDate.toISOString(),
        status: "Public",
        pollstatus: true,
      };

      // 1) Create folder on backend
      const folderRes = await fetch(`${API_BASE_URL}/folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(folderPayload),
      });

      if (!folderRes.ok) {
        console.error("Folder create failed:", await folderRes.text());
        Alert.alert("Error", "Failed to create folder on server.");
        setIsSaving(false);
        return;
      }

      const folderJson = await folderRes.json();
      console.log("Folder response:", folderJson);

      // data is an array, so pick the first row
      const folderRow = Array.isArray(folderJson.data) ? folderJson.data[0] : folderJson.data;
      const folderId = folderRow?.folderid;

      if (!folderId) {
        console.error("No folderid in response:", folderJson);
        Alert.alert("Error", "Folder created, but no folder ID was returned.");
        setIsSaving(false);
        return;
      }

      // 2) Create folder-attraction rows for each selected place
      const folerAttrPromises = selected.map((place) => {
        const payload = {
          folderid: folderId,
          attid: place.id, // attraction id from your favorite item
        };

        return fetch(`${API_BASE_URL}/folderattraction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      });

      const results = await Promise.all(folerAttrPromises);
      const failed = results.find((r) => !r.ok);

      if (failed) {
        Alert.alert(
          "Warning",
          "Folder created, but some attractions may not have been saved."
        );
      } else {
        Alert.alert("Success", "Folder created successfully!");
      }

      navigation.goBack();
    } catch (err) {
      console.error("Error creating folder:", err);
      Alert.alert("Error", "Something went wrong creating the folder.");
    } finally {
      setIsSaving(false);
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

  const canSubmit = folderName.trim() && selected.length > 0 && !isSaving;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
      >
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
          !canSubmit && { opacity: 0.5 },
        ]}
        disabled={!canSubmit}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>
          {isSaving ? "Saving..." : "Save Folder"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  closeBtn: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeBtnText: {
    fontSize: 26,
    color: "#1565C0",
    fontWeight: "bold",
    lineHeight: 30,
    marginTop: -2,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
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
    marginLeft: 20,
  },
  label: {
    fontSize: 15,
    color: "#2E3192",
    marginLeft: 20,
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
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
    marginLeft: 30,
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
    marginRight: 20,
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
