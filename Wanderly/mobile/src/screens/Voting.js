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
import { useRoute, useNavigation } from "@react-navigation/native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const getUidFromJWT = () => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub;
  } catch (err) {
    console.error("Failed to get uid from JWT:", err);
    return null;
  }
};

const Voting = () => {
  console.log("Voting successfully");
  const route = useRoute();
  const navigation = useNavigation();
  const { folderId } = route.params;

  const [folder, setFolder] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [selectedAttids, setSelectedAttids] = useState([]); // MULTI SELECT
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/folder/${folderId}`);
        if (!res.ok) {
          console.error("Failed to load folder for voting:", await res.text());
          Alert.alert("Error", "Folder not found");
          navigation.goBack();
          return;
        }
        const json = await res.json();
        setFolder(json.folder);
        setAttractions(Array.isArray(json.attractions) ? json.attractions : []);
      } catch (err) {
        console.error("Voting load error:", err);
        Alert.alert("Error", "Could not load folder for voting.");
        navigation.goBack();
      }
    };
    load();
  }, [folderId, navigation]);

  // MULTIPLE SELECTION
  const selectPlace = (attid) => {
    setSelectedAttids((prev) => {
      if (prev.includes(attid)) {
        return prev.filter((id) => id !== attid);
      }
      return [...prev, attid];
    });
  };

  // SUBMIT MULTIPLE VOTES
  const submitVote = async () => {
    if (selectedAttids.length === 0) {
      Alert.alert("Choose at least one", "Please pick at least one place.");
      return;
    }
    if (!folder) return;

    setIsSubmitting(true);

    try {
      const uid = getUidFromJWT() || "anonymous";
      const nowIso = new Date().toISOString();

      for (const attid of selectedAttids) {
        const payload = {
          folderid: folder.folderid,
          attid: attid,
          voter: uid,
          timevoted: nowIso,
        };

        await fetch(`${API_BASE_URL}/voting`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      Alert.alert("Thanks!", "Your votes have been recorded.");
      navigation.goBack();
    } catch (err) {
      console.error("Vote error:", err);
      Alert.alert("Error", "Could not submit votes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!folder) return null;

  const ended =
    folder.timeclosed && new Date(folder.timeclosed) <= new Date();

  const renderPlace = ({ item }) => {
    const attid = item.attid;
    const selected = selectedAttids.includes(attid);
    const title = item.name || `Attraction ${attid}`;

    return (
      <TouchableOpacity
        style={[styles.chooseRow, selected && styles.chooseSelected]}
        onPress={() => selectPlace(attid)}
      >
        {item.attpicture ? (
          <Image source={{ uri: item.attpicture }} style={styles.chooseImage} />
        ) : (
          <View style={[styles.chooseImage, { backgroundColor: "#ccc" }]} />
        )}

        <View style={styles.chooseContent}>
          <Text style={styles.chooseTitle}>{title}</Text>
        </View>

        {/* Checkbox */}
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <Text style={styles.radioInner}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{folder.foldername}</Text>

      {ended ? (
        <View style={styles.ended}>
          <Text style={{ fontWeight: "700" }}>This poll has ended.</Text>
        </View>
      ) : null}

      <FlatList
        data={attractions}
        keyExtractor={(item) => item.attid}
        renderItem={renderPlace}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
      />

      <TouchableOpacity
        style={[
          styles.voteBtn,
          (ended || selectedAttids.length === 0 || isSubmitting) && { opacity: 0.5 },
        ]}
        disabled={ended || selectedAttids.length === 0 || isSubmitting}
        onPress={submitVote}
      >
        <Text style={styles.voteBtnText}>Vote</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontSize: 28,
    fontWeight: "800",
    paddingHorizontal: 20,
    paddingTop: 18,
    marginBottom: 8,
    color: "#11468F",
  },
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
  ended: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F7EAEA",
    marginHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
});

export default Voting;
