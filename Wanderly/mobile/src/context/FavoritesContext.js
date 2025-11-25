import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();
const BackendURL = 'https://wanderly-seeo.onrender.com'; // adjust if needed

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

const getUidFromJWT = () => {
  try {
    const token = localStorage.getItem('jwt'); // get JWT from localStorage
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // uid is in `sub`
  } catch (err) {
    console.error('Failed to get uid from JWT:', err);
    return null;
  }
};

export const FavoritesProvider = ({ children }) => {
  const [places, setPlaces] = useState([]);

  // Fetch places from backend
  useEffect(() => {
  const fetchPlacesAndFavorites = async () => {
    try {
      // Fetch places
      const resPlaces = await fetch(`${BackendURL}/mock-data`);
      const data = await resPlaces.json();
      let loadedPlaces = data.mockPlaces || [];

      // Fetch user's favorites once
      const uid = getUidFromJWT();
      if (uid) {
        const resFav = await fetch(`${BackendURL}/favorites/${uid}`);
        const favData = await resFav.json();

        loadedPlaces = loadedPlaces.map(p => ({
          ...p,
          favorite: favData.some(f => String(f.attid) === String(p.id)) ? 1 : 0
        }));
      }

      setPlaces(loadedPlaces);
    } catch (err) {
      console.error(err);
    }
  };

  fetchPlacesAndFavorites();
}, []);


  const toggleFavorite = async (placeId) => {
    const uid = getUidFromJWT();
    if (!uid) {
      alert('Please log in first');
      return;
    }

    const place = places.find(p => String(p.id) === String(placeId));
    if (!place) return;

    const newFavoriteStatus = place.favorite === 1 ? 0 : 1;

    // Optimistic update
    setPlaces(prev =>
      prev.map(p => (String(p.id) === String(placeId) ? { ...p, favorite: newFavoriteStatus } : p))
    );

    try {
      if (newFavoriteStatus === 1) {
        // Add to favorites
        const res = await fetch(`${BackendURL}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid,
            attid: placeId,
            timecreated: new Date().toISOString()
          })
        });

        if (!res.ok) {
          const result = await res.json();
          console.error('Failed to add favorite:', result.detail || result);
          // Revert
          setPlaces(prev =>
            prev.map(p => (String(p.id) === String(placeId) ? { ...p, favorite: 0 } : p))
          );
        }
      } else {
        // Remove from favorites
        const res = await fetch(`${BackendURL}/favorites/${uid}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attid: placeId })
        });

        if (!res.ok) {
          const result = await res.json();
          console.error('Failed to remove favorite:', result.detail || result);
          // Revert
          setPlaces(prev =>
            prev.map(p => (String(p.id) === String(placeId) ? { ...p, favorite: 1 } : p))
          );
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert in case of network error
      setPlaces(prev =>
        prev.map(p => (String(p.id) === String(placeId) ? { ...p, favorite: place.favorite } : p))
      );
    }
  };

  // 👇 NEW: use the *same* logic as above, but only for removing
  const removeFavorite = async (placeId) => {
    const place = places.find(p => String(p.id) === String(placeId));
    // Only do anything if it's currently a favorite
    if (!place || place.favorite !== 1) return;

    // Reuse the existing, already-working logic
    await toggleFavorite(placeId);
  };



  const getFavorites = () => places.filter(p => p.favorite === 1);

  const addPlace = (newPlaceData) => {
    const newPlace = {
      id: Math.max(...places.map(p => p.id), 0) + 1,
      name: newPlaceData.name,
      location: newPlaceData.location,
      image: newPlaceData.image || 'https://via.placeholder.com/400x300?text=No+Image',
      description: newPlaceData.description,
      favorite: 1,
      verified: typeof newPlaceData.verified === 'boolean' ? newPlaceData.verified : false,
    };
    setPlaces(prev => [newPlace, ...prev]);
  };

  const value = { places, toggleFavorite, getFavorites, removeFavorite, addPlace };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
