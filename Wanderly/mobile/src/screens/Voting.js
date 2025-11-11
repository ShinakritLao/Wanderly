// Voting.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";

const Voting = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { folderId } = route.params;
  const [folder, setFolder] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVotedThisDevice, setHasVotedThisDevice] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AsyncStorage.getItem("folders");
        const folders = data ? JSON.parse(data) : [];
        const found = folders.find((f) => f.id === folderId);
        if (!found) {
          Alert.alert("Not found", "Folder not found");
          navigation.goBack();
          return;
        }
        setFolder(found);

        // check local flag whether this device already voted for this folder
        const votedRaw = await AsyncStorage.getItem("votedFolders");
        const voted = votedRaw ? JSON.parse(votedRaw) : [];
        if (voted.includes(folderId)) setHasVotedThisDevice(true);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [folderId, navigation]);

  const selectPlace = (placeId) => {
    setSelectedPlaceId(placeId === selectedPlaceId ? null : placeId);
  };

  const submitVote = async () => {
    if (!selectedPlaceId) {
      Alert.alert("Choose one", "Please pick a place to vote for.");
      return;
    }
    if (hasVotedThisDevice) {
      Alert.alert("Already voted", "This device has already voted in this poll.");
      return;
    }
    setIsSubmitting(true);
    try {
      const stored = await AsyncStorage.getItem("folders");
      const folders = stored ? JSON.parse(stored) : [];
      const idx = folders.findIndex((f) => f.id === folderId);
      if (idx === -1) throw new Error("Folder not found");

      // increment vote
      const votes = folders[idx].votes || {};
      votes[selectedPlaceId] = (votes[selectedPlaceId] || 0) + 1;
      folders[idx].votes = votes;

      await AsyncStorage.setItem("folders", JSON.stringify(folders));

      // mark this device as voted for this folder
      const votedRaw = await AsyncStorage.getItem("votedFolders");
      const voted = votedRaw ? JSON.parse(votedRaw) : [];
      voted.push(folderId);
      await AsyncStorage.setItem("votedFolders", JSON.stringify(voted));

      setHasVotedThisDevice(true);
      Alert.alert("Thanks!", "Your vote has been recorded.");
      navigation.goBack();
    } catch (err) {
      console.error("Vote error:", err);
      Alert.alert("Error", "Could not submit vote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPlace = ({ item }) => {
    const selected = selectedPlaceId === item.id;
    return (
      <TouchableOpacity style={[styles.chooseRow, selected && styles.chooseSelected]} onPress={() => selectPlace(item.id)}>
        <Image source={{ uri: item.image }} style={styles.chooseImage} />
        <View style={styles.chooseContent}>
          <Text style={styles.chooseTitle}>{item.name}</Text>
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <Text style={styles.radioInner}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (!folder) return null;

  // if poll ended, prevent voting
  const ended = new Date(folder.endDate) <= new Date();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{folder.name}</Text>

      {ended ? (
        <View style={styles.ended}>
          <Text style={{ fontWeight: "700" }}>This poll has ended.</Text>
        </View>
      ) : null}

      <FlatList
        data={folder.places}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlace}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
      />

      <TouchableOpacity
        style={[styles.voteBtn, (hasVotedThisDevice || ended || !selectedPlaceId) && { opacity: 0.5 }]}
        disabled={hasVotedThisDevice || ended || !selectedPlaceId || isSubmitting}
        onPress={submitVote}
      >
        <Text style={styles.voteBtnText}>{hasVotedThisDevice ? "Voted" : "Vote"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 28, fontWeight: "800", paddingHorizontal: 20, paddingTop: 18, marginBottom: 8, color: "#11468F" },
  chooseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#203265",
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 14,
    height: 110,
  },
  chooseSelected: {
    borderWidth: 2,
    borderColor: "#00AEEF",
  },
  chooseImage: { width: 120, height: "100%" },
  chooseContent: { flex: 1, padding: 12 },
  chooseTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  radio: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { backgroundColor: "#fff" },
  radioInner: { color: "#203265", fontWeight: "700" },
  voteBtn: {
    backgroundColor: "#00AEEF",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  voteBtnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  ended: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#F7EAEA", marginHorizontal: 20, borderRadius: 10, marginTop: 10 },
});

export default Voting;
