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
  Dimensions,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { mockReviews } from '../data/mockData';
import { useFavorites } from '../context/FavoritesContext';

import Logo from '../assets/Wanderly-Color-Logo.png';

const { width, height } = Dimensions.get('window');

const Home = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { places, toggleFavorite } = useFavorites();

  // Filter places based on search text
  const searchResults = searchText.trim().length > 0
    ? places.filter(place => 
        place.name.toLowerCase().includes(searchText.toLowerCase()) ||
        place.location.toLowerCase().includes(searchText.toLowerCase())
      ).slice(0, 5) // Limit to 5 results
    : [];

  const handleSearchChange = (text) => {
    setSearchText(text);
    setShowSearchResults(text.trim().length > 0);
  };

  const selectSearchResult = (place) => {
    setSearchText('');
    setShowSearchResults(false);
    openDetailModal(place);
  };

  const openDetailModal = (place) => {
    setSelectedPlace(place);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setTimeout(() => setSelectedPlace(null), 300);
  };

  // Get fresh place data for the modal
  const getPlaceById = (id) => {
    return places.find(p => p.id === id);
  };

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
    <TouchableOpacity 
      style={styles.placeCard}
      onPress={() => openDetailModal(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.placeImage} />
      <View style={styles.placeOverlay}>
        <TouchableOpacity 
          style={styles.heartButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Results Dropdown - Outside ScrollView */}
      {showSearchResults && searchResults.length > 0 && (
        <View style={styles.searchResultsOverlay}>
          <View style={styles.searchResultsContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {searchResults.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.searchResultItem}
                  onPress={() => selectSearchResult(place)}
                >
                  <Image 
                    source={{ uri: place.image }} 
                    style={styles.searchResultImage}
                  />
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultName}>{place.name}</Text>
                    <Text style={styles.searchResultLocation}>{place.location}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image 
            source={Logo} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Type where do you want to go..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearchChange}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchText('');
                setShowSearchResults(false);
              }}>
                <Feather name="x" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

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

      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPlace && (
              <>
                <Image 
                  source={{ uri: selectedPlace.image }} 
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                
                <View style={styles.detailCardOverlay}>
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(selectedPlace.id)}
                  >
                    <Feather
                      name="heart"
                      size={24}
                      color={getPlaceById(selectedPlace.id)?.favorite === 1 ? '#FF0000' : '#FFF'}
                      fill={getPlaceById(selectedPlace.id)?.favorite === 1 ? '#FF0000' : 'transparent'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={closeDetailModal}
                  >
                    <Feather name="x" size={24} color="#FFF" />
                  </TouchableOpacity>
                  
                  <Text style={styles.modalPlaceName}>{selectedPlace.name}</Text>
                  
                  <View style={styles.modalLocationRow}>
                    <Feather name="map-pin" size={16} color="#FFF" />
                    <Text style={styles.modalLocationText}>{selectedPlace.location}</Text>
                  </View>
                  
                  <ScrollView 
                    style={styles.descriptionScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.modalDescription}>
                      {selectedPlace.description || 
                        `The city of ${selectedPlace.name}, a global center for banking and finance, lies at the north end of Lake ${selectedPlace.location.split(',')[0]} in northern ${selectedPlace.location.split(',')[1]}. The picturesque lanes of the central Altstadt (Old Town), on either side of the Limmat River, reflect its pre-medieval history. Waterfront promenades like the Limmatquai follow the river toward the 17th-century Rathaus (town hall).`
                      }
                    </Text>
                  </ScrollView>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  searchWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
  searchResultsOverlay: {
    position: 'absolute',
    top: 210,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  searchResultsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  searchResultLocation: {
    fontSize: 12,
    color: '#999',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width - 40,
    height: height * 0.85,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  detailCardOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    bottom: 60,
    backgroundColor: 'rgba(27, 58, 122, 0.92)',
    padding: 25,
    paddingTop: 60,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalPlaceName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalLocationText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 6,
  },
  descriptionScroll: {
    flex: 1,
  },
  modalDescription: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 22,
    textAlign: 'justify',
  },
});

export default Home;