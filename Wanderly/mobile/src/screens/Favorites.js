import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';

import Logo from '../assets/Wanderly-Color-Logo.png';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;

const Favorites = () => {
  const { getFavorites, removeFavorite } = useFavorites();
  const favorites = getFavorites();
  const openCardId = useRef(null);

  const closeAllCards = () => {
    openCardId.current = null;
  };

  const FavoriteCard = ({ item }) => {
    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // Close other cards when this one is touched
          if (openCardId.current && openCardId.current !== item.id) {
            closeAllCards();
          }
        },
        onPanResponderMove: (_, gestureState) => {
          const isThisOpen = openCardId.current === item.id;
          // Only allow left swipe (negative dx) and limit the range
          const newValue = isThisOpen ? -width * 0.2 + gestureState.dx : gestureState.dx;
          if (newValue <= 0 && newValue >= -width * 0.2) {
            translateX.setValue(newValue);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const isThisOpen = openCardId.current === item.id;
          
          if (isThisOpen) {
            // Card is already open
            // If swiping right even a little bit, close it
            if (gestureState.dx > 10) {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
              }).start();
              openCardId.current = null;
            } else {
              // Keep it open
              Animated.spring(translateX, {
                toValue: -width * 0.2,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
              }).start();
            }
          } else {
            // Card is closed
            // Open if swiped more than 50px to the left
            if (gestureState.dx < -50) {
              Animated.spring(translateX, {
                toValue: -width * 0.2,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
              }).start();
              openCardId.current = item.id;
            } else {
              // Snap back to closed
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
              }).start();
            }
          }
        },
      })
    ).current;

    const handleDelete = () => {
      // Animate out then remove
      Animated.timing(translateX, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        removeFavorite(item.id);
        openCardId.current = null;
      });
    };

    return (
      <View style={styles.cardContainer}>
        {/* Delete Button Background */}
        <View style={styles.deleteBackground}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Swipeable Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.placeName}>{item.name}</Text>
            <View style={styles.locationContainer}>
              <Feather name="map-pin" size={12} color="#FFF" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
            <Text style={styles.description} numberOfLines={3}>
              {item.description || `Explore the beautiful ${item.name}, one of the most iconic destinations in ${item.location.split(',')[1] || item.location}.`}
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={Logo}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Your favourite</Text>

      {/* Favorites List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {favorites.length > 0 ? (
          favorites.map((item) => <FavoriteCard key={item.id} item={item} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="heart" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Add places to your favorites from Home or Tinder page
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B1462',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    height: 120,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 15,
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    right: -1,
    left: '75%',
    height: '100%',
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    height: '100%',
    backgroundColor: '#1B3A7A',
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardImage: {
    width: 120,
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  description: {
    fontSize: 11,
    color: '#FFF',
    lineHeight: 15,
    opacity: 0.85,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default Favorites;