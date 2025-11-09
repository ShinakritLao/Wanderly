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

  // Add a new place
  const addPlace = ({ name, location, image }) => {
    const newPlace = {
      id: Date.now().toString(),
      name: name || 'Untitled Place',
      location: location || '',
      image: image || 'https://via.placeholder.com/800',
      rating: 0,
      category: [],
      price: [],
      environment: [],
      favorite: 0,
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