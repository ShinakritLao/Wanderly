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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const API_BASE_URL = "https://wanderly-puy6.onrender.com";

const FolderDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { folderId } = route.params;

  const [folder, setFolder] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [voteCounts, setVoteCounts] = useState({}); // { attid: count }
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1) Load folder + attractions
      const folderRes = await fetch(`${API_BASE_URL}/folder/${folderId}`);
      if (!folderRes.ok) {
        console.error("Failed to load folder:", await folderRes.text());
        return;
      }
      const folderJson = await folderRes.json();
      setFolder(folderJson.folder);
      setAttractions(Array.isArray(folderJson.attractions) ? folderJson.attractions : []);

      // 2) Load votes for this folder
      const votesRes = await fetch(`${API_BASE_URL}/voting/${folderId}`);
      if (!votesRes.ok) {
        console.error("Failed to load votes:", await votesRes.text());
      } else {
        const votesJson = await votesRes.json();
        const rows = Array.isArray(votesJson.data) ? votesJson.data : [];
        const counts = {};
        rows.forEach((v) => {
          const key = v.attid;
          counts[key] = (counts[key] || 0) + 1;
        });
        setVoteCounts(counts);
      }
    } catch (err) {
      console.error("Error loading folder detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadData);
    loadData();

    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [folderId, navigation]);

  if (!folder && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Folder not found</Text>
      </SafeAreaView>
    );
  }

  const createdDate = folder?.timecreated ? new Date(folder.timecreated) : null;
  const endDate = folder?.timeclosed ? new Date(folder.timeclosed) : null;

  const totalVotes = Object.values(voteCounts).reduce((sum, c) => sum + c, 0);
  const votedPeople = totalVotes;

  const getRemaining = () => {
    if (!endDate) return "-";
    const diff = endDate - now;
    if (diff <= 0 || folder?.pollstatus === false) return "Poll ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const remaining = getRemaining();

  const handleCopyLink = async () => {
    try {
      let link = "";

      if (typeof window !== "undefined") {
        link = `${window.location.origin}/vote/${folder.folderid}`;
      } else {
        link = `myapp://vote/${folder.folderid}`;
      }

      await navigator.clipboard.writeText(link);
      Alert.alert("Voting link copied!", link);
    } catch (err) {
      console.error("Failed to copy link:", err);
      Alert.alert("Error", "Could not copy the voting link.");
    }
  };

  const openVoting = () => {
    navigation.navigate("Voting", { folderId: folder.folderid });
  };

  const handleEndVote = async () => {
    try {
      const nowIso = new Date().toISOString();
      const res = await fetch(`${API_BASE_URL}/folder/${folder.folderid}/end`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeclosed: nowIso,
          pollstatus: false, // 👈 boolean, matches backend change
        }),
      });

      if (!res.ok) {
        console.error("Failed to end voting:", await res.text());
        Alert.alert("Error", "Could not end voting early.");
        return;
      }

      const json = await res.json();
      const updated = json.data || folder;
      setFolder(updated);
      Alert.alert("Voting ended", "The poll has been closed.");
    } catch (err) {
      console.error("Failed to end vote:", err);
      Alert.alert("Error", "Could not end voting early.");
    }
  };

  const renderResult = ({ item }) => {
    const attid = item.attid;
    const count = voteCounts[attid] || 0;
    const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);

    const title = item.attname || item.name || `Attraction ${attid}`;

    return (
      <View style={styles.resultWrapper}>
        <Text style={styles.placeName}>{title}</Text>

        <View style={styles.resultRow}>
          {item.attpicture ? (
            <Image source={{ uri: item.attpicture }} style={styles.resultImage} />
          ) : (
            <View style={[styles.resultImage, { backgroundColor: "#ddd" }]} />
          )}

          <View style={[styles.resultOverlay, { width: `${percent}%` }]} />

          <View className="percentContainer" style={styles.percentContainer}>
            <Text style={styles.percentText}>{percent}%</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>

        <Text style={styles.folderTitle}>{folder?.foldername || "Folder"}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>👥 {votedPeople} people</Text>
          {createdDate && endDate && (
            <Text style={styles.metaText}>
              {createdDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </Text>
          )}
          <Text style={[styles.metaText, { marginTop: 6 }]}>Remaining: {remaining}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Vote Result</Text>

      {loading ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={attractions}
          keyExtractor={(item) => item.attid}
          renderItem={renderResult}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        />
      )}

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink}>
          <Text style={styles.copyText}>Copy link</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.voteBtn} onPress={openVoting}>
          <Text style={styles.voteText}>Open voting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.voteBtn, { backgroundColor: "#B71C1C", marginLeft: 8 }]}
          onPress={handleEndVote}
          disabled={remaining === "Poll ended"}
        >
          <Text style={[styles.voteText, { color: "#fff" }]}>End Vote</Text>
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
    left: 40,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  percentText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
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
    marginBottom: 30,
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
    marginBottom: 30,
  },
  voteText: { color: "#fff", fontWeight: "700" },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 14,
    zIndex: 10,
    backgroundColor: "#fff",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  closeButtonText: {
    color: "#1B1462",
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 28,
    textAlign: "center",
    marginTop: -2,
  },
});

export default FolderDetail;
