// FolderDetail.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Clipboard from "@react-native-clipboard/clipboard";

const FolderDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { folderId } = route.params;
  const [folder, setFolder] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const loadFolder = async () => {
      try {
        const data = await AsyncStorage.getItem("folders");
        const folders = data ? JSON.parse(data) : [];
        const found = folders.find((f) => f.id === folderId);
        if (found) setFolder(found);
      } catch (err) {
        console.error("Failed to load folder:", err);
      }
    };

    const unsubscribe = navigation.addListener("focus", loadFolder);
    loadFolder();

    // refresh "now" every 30s so remaining time updates
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [folderId, navigation]);

  if (!folder) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Folder not found</Text>
      </SafeAreaView>
    );
  }

  const totalVotes = Object.values(folder.votes || {}).reduce((s, v) => s + (v || 0), 0);
  const votedPeople = totalVotes; // for simple model: votes count = number of votes
  const createdDate = new Date(folder.createdAt);
  const endDate = new Date(folder.endDate);

  const getRemaining = () => {
    const diff = endDate - now;
    if (diff <= 0) return "Poll ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleCopyLink = async () => {
    try {
      let link = "";
  
      // ✅ Generate the voting page link
      if (typeof window !== "undefined") {
        // Web link (example: https://yourapp.com/vote/<folderId>)
        link = `${window.location.origin}/vote/${folder.id}`;
      } else {
        // Mobile deep link (example: myapp://vote/<folderId>)
        link = `myapp://vote/${folder.id}`;
      }
  
      // ✅ Copy to clipboard (supports both web & native)
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(link);
      } else {
        Clipboard.setString(link);
      }
  
      // ✅ Confirmation alert
      Alert.alert("Voting link copied!", link);
    } catch (err) {
      console.error("Failed to copy link:", err);
      Alert.alert("Error", "Could not copy the voting link.");
    }
  };   

  const openVoting = () => {
    navigation.navigate("Voting", { folderId: folder.id });
  };

  const renderResult = ({ item }) => {
    const count = folder.votes && folder.votes[item.id] ? folder.votes[item.id] : 0;
    const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
  
    return (
      <View style={styles.resultWrapper}>
        {/* Place name outside (top left) */}
        <Text style={styles.placeName}>{item.name}</Text>
  
        {/* Image + overlay bar */}
        <View style={styles.resultRow}>
          <Image source={{ uri: item.image }} style={styles.resultImage} />
  
          {/* Dynamic blue bar */}
          <View style={[styles.resultOverlay, { width: `${percent}%` }]} />
  
          {/* Percentage text on left */}
          <View style={styles.percentContainer}>
            <Text style={styles.percentText}>{percent}%</Text>
          </View>
        </View>
      </View>
    );
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.folderTitle}>{folder.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>👥 {votedPeople} people</Text>
          <Text style={styles.metaText}>
            {createdDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </Text>
          <Text style={[styles.metaText, { marginTop: 6 }]}>Remaining: {getRemaining()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Vote Result</Text>

      <FlatList
        data={folder.places}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderResult}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
      />

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
          <Text style={styles.copyText}>Copy link</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.voteBtn} onPress={openVoting}>
          <Text style={styles.voteText}>Open voting</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerCard: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#27408B",
    elevation: 3,
  },
  folderTitle: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 8 },
  metaRow: { marginTop: 4 },
  metaText: { color: "#DCE6FF", fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginLeft: 20, marginTop: 8, color: "#1B1462" },
  resultRow: {
    marginTop: 14,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#eee",
    height: 80,
  },
  resultImage: { width: "100%", height: "100%", position: "absolute" },
  resultOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(35, 48, 108, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },  
  percentText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  resultName: {
    position: "absolute",
    left: "38%",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingLeft: 12,
  },
  itemName: { color: "#fff", fontSize: 16, fontWeight: "700" },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 16,
  },
  copyBtn: {
    borderWidth: 1,
    borderColor: "#1B1462",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 8,
    marginBottom: 30
  },
  copyText: { color: "#1B1462", fontWeight: "700" },
  voteBtn: {
    backgroundColor: "#1B1462",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 8,
    marginBottom: 30
  },
  voteText: { color: "#fff", fontWeight: "700" },
  resultWrapper: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  
  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B1462",
    marginBottom: 6,
    marginLeft: 4,
  },
  
  resultRow: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#eee",
    height: 80,
    position: "relative",
  },
  
  resultImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    borderRadius: 14,
  },
  
  resultOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(35, 48, 108, 0.75)",
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  
  percentContainer: {
    position: "absolute",
    left: 40, // margin from the left edge
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  
  percentText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },  
});

export default FolderDetail;
