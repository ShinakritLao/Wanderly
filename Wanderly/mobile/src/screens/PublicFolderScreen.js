
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { mockPlaces } from '../data/mockData';


export default function PublicFolderScreen({ route }) {
  // For web: React Navigation passes params via route.params or route.match.params
  // Try both for compatibility
  const folderId = route?.params?.folderId || route?.params?.id || route?.match?.params?.folderId || route?.match?.params?.id;
  const folder = mockPlaces.find(f => f.id === folderId);
  const [votes, setVotes] = useState(0);
  const [voted, setVoted] = useState(false);

  if (!folder) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Folder not found</Text>
      </View>
    );
  }

  const handleVote = () => {
    setVotes(votes + 1);
    setVoted(true);
    Alert.alert('Thank you for voting!');
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: folder.image }} style={styles.image} />
      <Text style={styles.title}>{folder.name}</Text>
      <Text style={styles.location}>{folder.location}</Text>
      <Text style={styles.rating}>Rating: {folder.rating} ⭐</Text>
      <Text style={styles.sectionTitle}>Categories:</Text>
      <Text>{folder.category.join(', ')}</Text>
      <Text style={styles.sectionTitle}>Price:</Text>
      <Text>{folder.price.join(', ')}</Text>
      <Text style={styles.sectionTitle}>Environment:</Text>
      <Text>{folder.environment.join(', ')}</Text>

      <Text style={styles.sectionTitle}>Votes: {votes}</Text>
      <TouchableOpacity
        style={[styles.voteBtn, voted && styles.voteBtnDisabled]}
        onPress={handleVote}
        disabled={voted}
      >
        <Text style={styles.voteText}>{voted ? 'Voted' : 'Vote'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  voteBtn: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  voteBtnDisabled: {
    backgroundColor: '#aaa',
  },
  voteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: 22,
    color: 'red',
  },
});
