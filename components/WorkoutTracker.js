import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Vibration } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';

export default function WorkoutTracker({ workoutType, onUpdate }) {
  const [reps, setReps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [route, setRoute] = useState([]);

  const haversineDistance = useCallback((coord1, coord2) => {
    const toRad = (value) => value * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(coord1.latitude)) * 
      Math.cos(toRad(coord2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const calculateDistance = useCallback((coords) => {
    if (coords.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      total += haversineDistance(coords[i-1], coords[i]);
    }
    return total;
  }, [haversineDistance]);

  // Accelerometer effect
  useEffect(() => {
    let accelSub;
    if (workoutType === 'strength') {
      Accelerometer.setUpdateInterval(250);
      accelSub = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        if (acceleration > 1.8) {
          Vibration.vibrate(50);
          setReps(prev => {
            const newReps = prev + 1;
            onUpdate({ reps: newReps });
            return newReps;
          });
        }
      });
    }
    return () => accelSub?.remove();
  }, [workoutType, onUpdate]);

  // Location effect
  useEffect(() => {
    let locationSub;
    if (workoutType !== 'strength') {
      const startTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.HighForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (newLocation) => {
            const newCoords = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            };
            setRoute(prevRoute => {
              const updatedRoute = [...prevRoute, newCoords];
              const calculatedDistance = calculateDistance(updatedRoute);
              setDistance(calculatedDistance);
              onUpdate({ 
                distance: calculatedDistance,
                currentLocation: newCoords,
                routeCoordinates: updatedRoute
              });
              return updatedRoute;
            });
          }
        );
      };
      startTracking();
    }
    return () => locationSub?.remove();
  }, [workoutType, onUpdate, calculateDistance]);

  return (
    <View style={styles.container}>
      {workoutType === 'strength' ? (
        <View style={styles.repContainer}>
          <Text style={styles.repText}>REPS</Text>
          <Text style={styles.repCount}>{reps}</Text>
        </View>
      ) : (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>DISTANCE</Text>
          <Text style={styles.distanceValue}>{distance.toFixed(2)} km</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  repContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 15,
    width: '80%',
  },
  repText: {
    fontSize: 18,
    color: '#007aff',
    fontWeight: 'bold',
  },
  repCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007aff',
    marginTop: 5,
  },
  distanceContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 15,
    width: '80%',
  },
  distanceText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  distanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
});