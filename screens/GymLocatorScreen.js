import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

export default function GymLocatorScreen() {
  const [region, setRegion] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGym, setSelectedGym] = useState(null);
  const [radius, setRadius] = useState(2000); // Default 2km radius

  useEffect(() => {
    getLocationAndGyms();
  }, [radius]);

  const getLocationAndGyms = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const userRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(userRegion);
      await fetchNearbyGyms(userRegion.latitude, userRegion.longitude);
    } catch (error) {
      setErrorMsg('Error getting location');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyGyms = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${lat},${lng}`,
            radius: radius,
            type: 'gym',
            key: '', 
          }
        }
      );
      
      // Get details for each gym
      const gymsWithDetails = await Promise.all(
        response.data.results.map(async (gym) => {
          try {
            const detailsResponse = await axios.get(
              `https://maps.googleapis.com/maps/api/place/details/json`,
              {
                params: {
                  place_id: gym.place_id,
                  fields: 'formatted_phone_number,website,opening_hours,rating,photos',
                  key: 'YOUR_GOOGLE_API_KEY', // Replace with your actual API key
                }
              }
            );
            return {
              ...gym,
              ...detailsResponse.data.result,
            };
          } catch (error) {
            console.error('Error fetching gym details:', error);
            return gym;
          }
        })
      );
      
      setGyms(gymsWithDetails);
    } catch (error) {
      console.error('Error fetching gyms:', error);
      setErrorMsg('Failed to load gym data. Please try again.');
    }
  };

  const handleRefresh = () => {
    getLocationAndGyms();
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
  };

  const openDirections = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Finding gyms within {radius/1000}km...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color="white" />
          <Text style={styles.refreshText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        toolbarEnabled={true}
      >
        {gyms.map((gym) => (
          <Marker
            key={gym.place_id}
            coordinate={{
              latitude: gym.geometry.location.lat,
              longitude: gym.geometry.location.lng,
            }}
            onPress={() => setSelectedGym(gym.place_id === selectedGym?.place_id ? null : gym)}
          >
            <View style={[
              styles.markerContainer,
              selectedGym?.place_id === gym.place_id && styles.selectedMarker
            ]}>
              <MaterialIcons 
                name="fitness-center" 
                size={28} 
                color={selectedGym?.place_id === gym.place_id ? '#FF5722' : '#007AFF'} 
              />
            </View>
            <Callout tooltip onPress={() => openDirections(gym.geometry.location.lat, gym.geometry.location.lng)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{gym.name}</Text>
                <Text style={styles.calloutAddress}>{gym.vicinity}</Text>
                
                {gym.rating && (
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{gym.rating} ({gym.user_ratings_total || 0} reviews)</Text>
                  </View>
                )}
                
                {gym.opening_hours && (
                  <Text style={[
                    styles.calloutDetail,
                    gym.opening_hours.open_now ? styles.openNow : styles.closedNow
                  ]}>
                    {gym.opening_hours.open_now ? 'OPEN NOW' : 'CLOSED'}
                  </Text>
                )}
                
                <TouchableOpacity 
                  style={styles.directionsButton}
                  onPress={() => openDirections(gym.geometry.location.lat, gym.geometry.location.lng)}
                >
                  <MaterialIcons name="directions" size={16} color="white" />
                  <Text style={styles.directionsText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      <View style={styles.radiusSelector}>
        <Text style={styles.radiusText}>Search Radius: {radius/1000}km</Text>
        <View style={styles.radiusButtons}>
          {[1000, 2000, 5000].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.radiusButton,
                radius === r && styles.activeRadiusButton
              ]}
              onPress={() => handleRadiusChange(r)}
            >
              <Text style={styles.radiusButtonText}>{r/1000}km</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <MaterialIcons name="refresh" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  refreshText: {
    color: 'white',
    marginTop: 4,
    fontSize: 12,
  },
  markerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    elevation: 5,
  },
  selectedMarker: {
    borderColor: '#FF5722',
    backgroundColor: '#FFF3E0',
  },
  calloutContainer: {
    width: 250,
    padding: 12,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  calloutAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  calloutDetail: {
    fontSize: 13,
    fontWeight: 'bold',
    marginVertical: 4,
    padding: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
  openNow: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  closedNow: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  directionsButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  directionsText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  radiusSelector: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  radiusText: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  radiusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radiusButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    minWidth: 60,
    alignItems: 'center',
  },
  activeRadiusButton: {
    backgroundColor: '#007AFF',
  },
  radiusButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});
