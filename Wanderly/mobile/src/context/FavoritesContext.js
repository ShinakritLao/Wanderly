import React, { createContext, useState, useContext } from 'react';
import { mockPlaces } from '../data/mockData';

// Create the context
const FavoritesContext = createContext();

// Custom hook to use the context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

// Provider component
export const FavoritesProvider = ({ children }) => {
  const [places, setPlaces] = useState(mockPlaces);

  // Toggle favorite status
  const toggleFavorite = (placeId) => {
    setPlaces(prevPlaces =>
      prevPlaces.map(place =>
        place.id === placeId
          ? { ...place, favorite: place.favorite === 1 ? 0 : 1 }
          : place
      )
    );
  };

  // Get all favorited places
  const getFavorites = () => {
    return places.filter(place => place.favorite === 1);
  };

  // Remove from favorites (for swipe delete in Favorites page)
  const removeFavorite = (placeId) => {
    setPlaces(prevPlaces =>
      prevPlaces.map(place =>
        place.id === placeId ? { ...place, favorite: 0 } : place
      )
    );
  };

  // Add new place
  const addPlace = (newPlaceData) => {
    const newPlace = {
      id: Math.max(...places.map(p => p.id), 0) + 1,
      name: newPlaceData.name,
      location: newPlaceData.location,
      image: newPlaceData.image || 'https://via.placeholder.com/400x300?text=No+Image',
      description: newPlaceData.description,
      favorite: 1, // Add as favorite by default
      // New field: whether the place is verified by admin (boolean)
      verified: typeof newPlaceData.verified === 'boolean' ? newPlaceData.verified : false,
    };
    setPlaces(prevPlaces => [newPlace, ...prevPlaces]);
  };

  const value = {
    places,
    toggleFavorite,
    getFavorites,
    removeFavorite,
    addPlace,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};