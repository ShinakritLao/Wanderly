import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { mockReviews } from '../data/mockData';
import { useFavorites } from '../context/FavoritesContext';

const { width } = Dimensions.get('window');

const Home = () => {
  const [searchText, setSearchText] = useState('');
  const { places, toggleFavorite } = useFavorites();

  const ReviewCard = ({ item }) => (
    <View style={styles.reviewCard}>
      <Image source={{ uri: item.image }} style={styles.reviewImage} />
      <View style={styles.reviewContent}>
        <View style={styles.reviewTop}>
          <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          <View style={styles.reviewTextContainer}>
            <Text style={styles.reviewPlaceName}>{item.placeName}</Text>
            <Text style={styles.reviewSnippet} numberOfLines={2}>
              {item.snippet}
            </Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={styles.starIcon}>
              {i < item.rating ? '⭐' : '☆'}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );

  const PlaceCard = ({ item }) => (
    <View style={styles.placeCard}>
      <Image source={{ uri: item.image }} style={styles.placeImage} />
      <View style={styles.placeOverlay}>
        <TouchableOpacity 
          style={styles.heartButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Feather
            name="heart"
            size={20}
            color={item.favorite === 1 ? '#FF0000' : '#FFF'}
            fill={item.favorite === 1 ? '#FF0000' : 'transparent'}
          />
        </TouchableOpacity>
        <View style={styles.placeInfo}>
          <Text style={styles.placeTitle}>{item.name}</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/Wanderly-Color-Logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Type where do you want to go..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Recent Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent reviews</Text>
          <FlatList
            data={mockReviews}
            renderItem={({ item }) => <ReviewCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsList}
          />
        </View>

        {/* Recommended Places Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended places</Text>
          <View style={styles.placesContainer}>
            {places.map((place, index) => (
              <View key={place.id} style={[
                styles.placeCardWrapper,
                index % 2 === 0 ? styles.leftCard : styles.rightCard
              ]}>
                <PlaceCard item={place} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 120,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1462',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  reviewsList: {
    paddingLeft: 20,
    paddingRight: 5,
  },
  reviewCard: {
    width: 255,
    height: 155,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#1271B1',
    flexDirection: 'column',
  },
  reviewImage: {
    width: '100%',
    height: '50%',
    resizeMode: 'cover',
  },
  reviewContent: {
    width: '100%',
    height: '50%',
    backgroundColor: '#172F7A',
    paddingLeft: 15,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    top: -38,
    right: 14,
  },
  reviewTextContainer: {
    flex: 1,
  },
  reviewPlaceName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 3,
  },
  reviewSnippet: {
    fontSize: 10,
    color: '#FFF',
    lineHeight: 13,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  starIcon: {
    fontSize: 12,
    marginLeft: 2,
  },
  placesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  placeCardWrapper: {
    width: (width - 50) / 2,
    marginBottom: 15,
  },
  leftCard: {
    marginRight: 5,
  },
  rightCard: {
    marginLeft: 5,
  },
  placeCard: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#135497',
  },
  placeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    justifyContent: 'space-between',
  },
  heartButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(18, 113, 177, 0.8)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  placeInfo: {
    alignSelf: 'flex-start',
  },
  placeTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default Home;