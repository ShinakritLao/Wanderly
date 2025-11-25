import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const FavoritesContext = createContext();
const BackendURL = 'http://127.0.0.1:8081'

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
const [places, setPlaces] = useState([]);

// Fetch places from backend on mount
useEffect(() => {
const fetchPlaces = async () => {
try {
const res = await fetch(`${BackendURL}/mock-data`); // adjust URL if needed
const data = await res.json();
setPlaces(data.mockPlaces || []);
} catch (error) {
console.error('Error fetching places:', error);
}
};
fetchPlaces();
}, []);

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

// Remove from favorites
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
image: newPlaceData.image || '[https://via.placeholder.com/400x300?text=No+Image](https://via.placeholder.com/400x300?text=No+Image)',
description: newPlaceData.description,
favorite: 1, // Add as favorite by default
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
