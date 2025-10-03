import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { tinderPlaces } from '../data/mockData';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const Tinder = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState(tinderPlaces);
  const [tempFilters, setTempFilters] = useState({
    country: 'All',
    priceRange: 'All',
    category: 'All',
    environment: 'All'
  });
  const [openDropdown, setOpenDropdown] = useState(null);

  const applyFilters = () => {
    let filtered = tinderPlaces;
    
    if (tempFilters.country !== 'All') {
      filtered = filtered.filter(place => place.location.includes(tempFilters.country));
    }
    if (tempFilters.priceRange !== 'All') {
      filtered = filtered.filter(place => place.price === tempFilters.priceRange);
    }
    if (tempFilters.category !== 'All') {
      filtered = filtered.filter(place => place.category === tempFilters.category);
    }
    if (tempFilters.environment !== 'All') {
      filtered = filtered.filter(place => place.environment === tempFilters.environment);
    }
    
    setFilteredPlaces(filtered);
    setCurrentIndex(0);
    setShowFilter(false);
    setFilters(tempFilters);
    setOpenDropdown(null);
  };

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
      rotate.setValue(gesture.dx / 10);
    },
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        // Swipe Right - Add to favorites
        handleSwipeRight();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        // Swipe Left - Reject
        handleSwipeLeft();
      } else {
        // Return to center
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        Animated.spring(rotate, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const handleSwipeRight = () => {
    const currentPlace = tinderPlaces[currentIndex];
    setFavorites(prev => [...prev, currentPlace]);
    animateCardOut('right');
  };

  const handleSwipeLeft = () => {
    animateCardOut('left');
  };

  const animateCardOut = (direction) => {
    const x = direction === 'right' ? width : -width;
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setCurrentIndex(prev => prev + 1);
      position.setValue({ x: 0, y: 0 });
      rotate.setValue(0);
      opacity.setValue(1);
    });
  };

  const getCardStyle = () => {
    const rotateStr = rotate.interpolate({
      inputRange: [-50, 0, 50],
      outputRange: ['-10deg', '0deg', '10deg'],
    });

    return {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotate: rotateStr },
      ],
      opacity,
    };
  };

  const getLikeOpacity = () => {
    return position.x.interpolate({
      inputRange: [0, 150],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  };

  const getRejectOpacity = () => {
    return position.x.interpolate({
      inputRange: [-150, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
  };

  const FilterDropdown = ({ label, value, options, field }) => (
    <View style={styles.filterItem}>
      <Text style={styles.filterLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.filterDropdown}
        onPress={() => setOpenDropdown(openDropdown === field ? null : field)}
      >
        <Text style={styles.filterValue}>{value}</Text>
        <Icon name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>
      {openDropdown === field && (
        <View style={styles.dropdownOptions}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownOption}
              onPress={() => {
                setTempFilters(prev => ({ ...prev, [field]: option }));
                setOpenDropdown(null);
              }}
            >
              <Text style={[
                styles.dropdownOptionText,
                option === value && styles.selectedOption
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (currentIndex >= filteredPlaces.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="heart" size={64} color="#4A90E2" />
          <Text style={styles.emptyTitle}>No more places!</Text>
          <Text style={styles.emptySubtitle}>Check your favorites or adjust filters</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              setCurrentIndex(0);
              setFilteredPlaces(tinderPlaces);
              setFilters({ country: 'All', priceRange: 'All', category: 'All', environment: 'All' });
              setTempFilters({ country: 'All', priceRange: 'All', category: 'All', environment: 'All' });
            }}
          >
            <Text style={styles.resetButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPlace = filteredPlaces[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Wanderly</Text>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {/* Next Card (Background) */}
        {currentIndex + 1 < filteredPlaces.length && (
          <View style={[styles.card, styles.nextCard]}>
            <Image 
              source={{ uri: filteredPlaces[currentIndex + 1].image }} 
              style={styles.cardImage} 
              resizeMode="cover"
            />
            <View style={styles.cardInfo}>
              <Text style={styles.placeName}>{filteredPlaces[currentIndex + 1].name}</Text>
              <View style={styles.locationRow}>
                <Icon name="map-pin" size={14} color="#FFF" />
                <Text style={styles.locationText}>{filteredPlaces[currentIndex + 1].location}</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>{filteredPlaces[currentIndex + 1].rating}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Current Card */}
        <Animated.View 
          style={[styles.card, getCardStyle()]} 
          {...panResponder.panHandlers}
        >
          <Image source={{ uri: currentPlace.image }} style={styles.cardImage} />
          
          {/* Filter Button - Top Right of Card */}
          <TouchableOpacity 
            style={styles.filterButtonOnCard}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Text style={styles.filterText}>Filter</Text>
            <Icon name="sliders" size={16} color="#4A90E2" />
          </TouchableOpacity>
          
          {/* Filter Panel - Inside Card */}
          {showFilter && (
            <View style={styles.filterOverlayInCard}>
              <View style={styles.filterPanelInCard}>
                <View style={styles.filterRow}>
                  <View style={styles.filterColumn}>
                    <FilterDropdown 
                      label="Country" 
                      field="country"
                      value={tempFilters.country}
                      options={['All', 'Japan', 'Switzerland', 'Canada', 'Peru', 'Spain', 'Greece', 'Jordan', 'Brazil', 'India', 'China']}
                    />
                    <FilterDropdown 
                      label="Category" 
                      field="category"
                      value={tempFilters.category}
                      options={['All', 'Nature', 'Culture', 'Adventure', 'Relaxation']}
                    />
                  </View>
                  <View style={styles.filterColumn}>
                    <FilterDropdown 
                      label="Price Range" 
                      field="priceRange"
                      value={tempFilters.priceRange}
                      options={['All', 'Budget', 'Mid-range', 'Luxury']}
                    />
                    <FilterDropdown 
                      label="Indoor or Outdoor" 
                      field="environment"
                      value={tempFilters.environment}
                      options={['All', 'Indoor', 'Outdoor']}
                    />
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={applyFilters}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Like Indicator */}
          <Animated.View style={[styles.likeIndicator, { opacity: getLikeOpacity() }]}>
            <View style={styles.indicatorCircle}>
              <Icon name="heart" size={60} color="#4CAF50" />
            </View>
          </Animated.View>

          {/* Reject Indicator */}
          <Animated.View style={[styles.rejectIndicator, { opacity: getRejectOpacity() }]}>
            <View style={styles.indicatorCircle}>
              <Icon name="x" size={60} color="#F44336" />
            </View>
          </Animated.View>

          <View style={styles.cardInfo}>
            <Text style={styles.placeName}>{currentPlace.name}</Text>
            <View style={styles.locationRow}>
              <Icon name="map-pin" size={14} color="#FFF" />
              <Text style={styles.locationText}>{currentPlace.location}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{currentPlace.rating}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleSwipeLeft}
        >
          <Icon name="x" size={24} color="#F44336" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleSwipeRight}
        >
          <Icon name="heart" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {filteredPlaces.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  filterButtonOnCard: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 5,
  },
  filterOverlayInCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  filterPanelInCard: {
    backgroundColor: 'rgba(173, 216, 230, 0.95)',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterColumn: {
    flex: 1,
    paddingHorizontal: 5,
  },
  filterItem: {
    marginBottom: 12,
    position: 'relative',
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  filterDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterValue: {
    fontSize: 14,
    color: '#333',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
    maxHeight: 120,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOption: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width - 60,
    height: height * 0.6,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    position: 'absolute',
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  cardImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 5,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 3,
    fontWeight: '600',
  },
  likeIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -75 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -75 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 80,
    paddingVertical: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  rejectButton: {
    borderWidth: 2,
    borderColor: '#F44336',
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  progressContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  resetButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Tinder;