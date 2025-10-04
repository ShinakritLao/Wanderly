import React, { useState, useRef, useEffect } from 'react';
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
  ScrollView,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Feather } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const Tinder = () => {
  const { places, toggleFavorite } = useFavorites();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState(places);
  const [showDepleted, setShowDepleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    price: [],
    environment: []
  });
  const [minMatches, setMinMatches] = useState(1);

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    setFilteredPlaces(places);
  }, [places]);

  useEffect(() => {
    if (currentIndex >= filteredPlaces.length && filteredPlaces.length > 0) {
      setShowDepleted(true);
    }
  }, [currentIndex, filteredPlaces]);

  const applyFilters = () => {
    let filtered = places;
    
    const allSelectedValues = [
      ...selectedFilters.category,
      ...selectedFilters.price,
      ...selectedFilters.environment
    ];

    if (allSelectedValues.length > 0) {
      filtered = filtered.filter(place => {
        // Count how many selected filters match this place
        let matchCount = 0;
        
        selectedFilters.category.forEach(cat => {
          if (place.category.includes(cat)) matchCount++;
        });
        selectedFilters.price.forEach(price => {
          if (place.price.includes(price)) matchCount++;
        });
        selectedFilters.environment.forEach(env => {
          if (place.environment.includes(env)) matchCount++;
        });
        
        return matchCount >= minMatches;
      });
    }
    
    setFilteredPlaces(filtered);
    setCurrentIndex(0);
    setShowFilter(false);
    setShowDepleted(false);
  };

  const toggleFilter = (type, value) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[type];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [type]: currentFilters.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [type]: [...currentFilters, value]
        };
      }
    });
  };

  const removeFilter = (type, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      category: [],
      price: [],
      environment: []
    });
    setMinMatches(1);
    setFilteredPlaces(places);
    setCurrentIndex(0);
    setShowFilter(false);
    setShowDepleted(false);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
      rotate.setValue(gesture.dx / 10);
    },
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        handleSwipeRight();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        handleSwipeLeft();
      } else {
        Animated.parallel([
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 7,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: true,
            friction: 7,
          }),
        ]).start();
      }
    },
  });

  const handleSwipeRight = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const currentPlace = filteredPlaces[currentIndex];
    // Animate first, then update favorite after
    animateCardOut('right', () => {
      toggleFavorite(currentPlace.id);
    });
  };

  const handleSwipeLeft = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    animateCardOut('left');
  };

  const animateCardOut = (direction) => {
    const x = direction === 'right' ? width + 100 : -width - 100;
    
    // Animate current card out and next card up simultaneously
    Animated.parallel([
      // Current card exit
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      // Next card scale up
      Animated.timing(nextCardScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(nextCardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update index
      setCurrentIndex(prev => prev + 1);
      
      // Reset all animations instantly (next frame)
      requestAnimationFrame(() => {
        position.setValue({ x: 0, y: 0 });
        rotate.setValue(0);
        opacity.setValue(1);
        nextCardScale.setValue(0.95);
        nextCardOpacity.setValue(0.5);
        setIsAnimating(false);
      });
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

  const FilterButton = ({ label, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SelectedFilterTag = ({ label, onRemove }) => (
    <View style={styles.selectedFilterTag}>
      <Text style={styles.selectedFilterText}>{label}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeFilterButton}>
        <Feather name="x" size={14} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const allSelectedFilters = [
    ...selectedFilters.category,
    ...selectedFilters.price,
    ...selectedFilters.environment
  ];

  // Get unique categories, prices, environments from all places
  const allCategories = [...new Set(places.flatMap(p => p.category))].sort();
  const allPrices = [...new Set(places.flatMap(p => p.price))].sort();
  const allEnvironments = [...new Set(places.flatMap(p => p.environment))].sort();

  if (currentIndex >= filteredPlaces.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Modal
          visible={showDepleted}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDepleted(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.depletedModal}>
              <Feather name="heart" size={64} color="#4A90E2" />
              <Text style={styles.depletedTitle}>All Filtered Content Depleted!</Text>
              <Text style={styles.depletedSubtitle}>
                You've seen all places matching your filters.
              </Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={clearAllFilters}
              >
                <Text style={styles.modalButtonText}>Start Over</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.emptyContainer}>
          <Feather name="heart" size={64} color="#4A90E2" />
          <Text style={styles.emptyTitle}>No more places!</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={clearAllFilters}
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
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/Wanderly-Color-Logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButtonHeader}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Feather name="sliders" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      {showFilter && (
        <View style={styles.filterOverlay}>
          <View style={styles.filterPanel}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterTitle}>Filter Places</Text>
              
              {/* Category Filters */}
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterChipsContainer}>
                {allCategories.map(cat => (
                  <FilterButton
                    key={cat}
                    label={cat}
                    isSelected={selectedFilters.category.includes(cat)}
                    onPress={() => toggleFilter('category', cat)}
                  />
                ))}
              </View>

              {/* Price Filters */}
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.filterChipsContainer}>
                {allPrices.map(price => (
                  <FilterButton
                    key={price}
                    label={price}
                    isSelected={selectedFilters.price.includes(price)}
                    onPress={() => toggleFilter('price', price)}
                  />
                ))}
              </View>

              {/* Environment Filters */}
              <Text style={styles.filterSectionTitle}>Environment</Text>
              <View style={styles.filterChipsContainer}>
                {allEnvironments.map(env => (
                  <FilterButton
                    key={env}
                    label={env}
                    isSelected={selectedFilters.environment.includes(env)}
                    onPress={() => toggleFilter('environment', env)}
                  />
                ))}
              </View>

              {/* Selected Filters Display */}
              {allSelectedFilters.length > 0 && (
                <>
                  {/* Minimum Matches Slider */}
                  <View style={styles.sliderSection}>
                    <View style={styles.sliderHeader}>
                      <Text style={styles.filterSectionTitle}>Minimum Matches</Text>
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchBadgeText}>{minMatches}</Text>
                      </View>
                    </View>
                    <Text style={styles.sliderDescription}>
                      Show places that match at least {minMatches} of your selected filter{minMatches > 1 ? 's' : ''}
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={allSelectedFilters.length}
                      step={1}
                      value={minMatches}
                      onValueChange={setMinMatches}
                      minimumTrackTintColor="#4A90E2"
                      maximumTrackTintColor="#DDD"
                      thumbTintColor="#4A90E2"
                    />
                    <View style={styles.sliderLabels}>
                      <Text style={styles.sliderLabelText}>1</Text>
                      <Text style={styles.sliderLabelText}>{allSelectedFilters.length}</Text>
                    </View>
                  </View>

                  <Text style={styles.filterSectionTitle}>Active Filters</Text>
                  <View style={styles.selectedFiltersContainer}>
                    {selectedFilters.category.map(cat => (
                      <SelectedFilterTag
                        key={cat}
                        label={cat}
                        onRemove={() => removeFilter('category', cat)}
                      />
                    ))}
                    {selectedFilters.price.map(price => (
                      <SelectedFilterTag
                        key={price}
                        label={price}
                        onRemove={() => removeFilter('price', price)}
                      />
                    ))}
                    {selectedFilters.environment.map(env => (
                      <SelectedFilterTag
                        key={env}
                        label={env}
                        onRemove={() => removeFilter('environment', env)}
                      />
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.filterActions}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={applyFilters}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {/* Next Card (Background) */}
        {currentIndex + 1 < filteredPlaces.length && (
          <Animated.View 
            style={[
              styles.card, 
              styles.nextCard,
              {
                transform: [{ scale: nextCardScale }],
                opacity: nextCardOpacity,
              }
            ]} 
            pointerEvents="none"
          >
            <Image 
              source={{ uri: filteredPlaces[currentIndex + 1].image }} 
              style={styles.cardImage} 
              resizeMode="cover"
            />
            <View style={styles.cardInfo}>
              <Text style={styles.placeName}>{filteredPlaces[currentIndex + 1].name}</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={14} color="#FFF" />
                <Text style={styles.locationText}>{filteredPlaces[currentIndex + 1].location}</Text>
                <View style={styles.ratingContainer}>
                  <Feather name="star" size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>{filteredPlaces[currentIndex + 1].rating}</Text>
                </View>
              </View>
              <View style={styles.tagsRow}>
                {filteredPlaces[currentIndex + 1].category.map((cat, idx) => (
                  <View key={idx} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Current Card */}
        <Animated.View 
          style={[styles.card, getCardStyle(), { zIndex: 1 }]} 
          {...panResponder.panHandlers}
        >
            <Image source={{ uri: currentPlace.image }} style={styles.cardImage} />
            
            {/* Like Indicator */}
            <Animated.View style={[styles.likeIndicator, { opacity: getLikeOpacity() }]}>
              <View style={styles.indicatorCircle}>
                <Feather name="heart" size={60} color="#4CAF50" />
              </View>
            </Animated.View>

            {/* Reject Indicator */}
            <Animated.View style={[styles.rejectIndicator, { opacity: getRejectOpacity() }]}>
              <View style={styles.indicatorCircle}>
                <Feather name="x" size={60} color="#F44336" />
              </View>
            </Animated.View>

            <View style={styles.cardInfo}>
              <Text style={styles.placeName}>{currentPlace.name}</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={14} color="#FFF" />
                <Text style={styles.locationText}>{currentPlace.location}</Text>
                <View style={styles.ratingContainer}>
                  <Feather name="star" size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>{currentPlace.rating}</Text>
                </View>
              </View>
              <View style={styles.tagsRow}>
                {currentPlace.category.map((cat, idx) => (
                  <View key={idx} style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{cat}</Text>
                  </View>
                ))}
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
          <Feather name="x" size={24} color="#F44336" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleSwipeRight}
        >
          <Feather name="heart" size={24} color="#4CAF50" />
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: 'relative',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 80,
  },
  filterButtonHeader: {
    position: 'absolute',
    right: 20,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  filterPanel: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  filterTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B1462',
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  filterChipSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  selectedFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4F8',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  selectedFilterText: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
  removeFilterButton: {
    padding: 2,
  },
  sliderSection: {
    marginTop: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 30,
    alignItems: 'center',
  },
  matchBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#999',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
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
    backgroundColor: '#323232',
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
    zIndex: 0,
  },
  cardImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
    backgroundColor: '#323232',
  },
  cardInfo: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    backgroundColor: '#323232',
    padding: 20,
    paddingBottom: 25,
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 5,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryTag: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryTagText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  depletedModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: width - 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  depletedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  depletedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 30,
  },
  resetButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Tinder;