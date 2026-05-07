import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import WorkoutTracker from '../components/WorkoutTracker';

export default function WorkoutScreen({ route, navigation }) {
  const { workoutType } = route.params;
  const [isActive, setIsActive] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [workoutData, setWorkoutData] = useState({
    reps: 0,
    distance: 0,
    duration: 0,
    calories: 0,
    routeCoordinates: []
  });
  const [region, setRegion] = useState(null);

  const calculateCaloriesBurned = useCallback((minutes, type) => {
    const baseCalories = type === 'strength' ? 8 : 10;
    return Math.floor(minutes * baseCalories * (workoutData.reps > 0 ? 1.2 : 1));
  }, [workoutData.reps]);

  const handleWorkoutUpdate = useCallback((newData) => {
    setWorkoutData(prev => {
      const updatedData = {
        ...prev,
        ...newData,
        duration: workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 60000) : 0,
        calories: calculateCaloriesBurned(
          workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 60000) : 0,
          workoutType
        )
      };

      if (newData.currentLocation) {
        setRegion({
          latitude: newData.currentLocation.latitude,
          longitude: newData.currentLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }

      return updatedData;
    });
  }, [workoutStartTime, workoutType, calculateCaloriesBurned]);

  const startWorkout = useCallback(async () => {
    setIsActive(true);
    setWorkoutStartTime(Date.now());
    setWorkoutData({
      reps: 0,
      distance: 0,
      duration: 0,
      calories: 0,
      routeCoordinates: []
    });
  }, []);

  const stopWorkout = useCallback(() => {
    setIsActive(false);
    navigation.navigate('Progress', { workoutData });
  }, [workoutData, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{workoutType.toUpperCase()} WORKOUT</Text>
      
      {isActive ? (
        <>
          <WorkoutTracker 
            workoutType={workoutType} 
            onUpdate={handleWorkoutUpdate}
          />
          
          {workoutType !== 'strength' && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={region || {
                  latitude: 37.78825,
                  longitude: -122.4324,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                followsUserLocation={true}
              >
                {workoutData.routeCoordinates.length > 1 && (
                  <Polyline
                    coordinates={workoutData.routeCoordinates}
                    strokeColor="#007AFF"
                    strokeWidth={4}
                  />
                )}
                {workoutData.routeCoordinates.length > 0 && (
                  <Marker
                    coordinate={workoutData.routeCoordinates[workoutData.routeCoordinates.length - 1]}
                    title="Your Location"
                  />
                )}
              </MapView>
            </View>
          )}
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {workoutType === 'strength' ? workoutData.reps : workoutData.distance.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>
                {workoutType === 'strength' ? 'Reps' : 'Km'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workoutData.duration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workoutData.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.stopButton} onPress={stopWorkout}>
            <Text style={styles.buttonText}>FINISH WORKOUT</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.startContainer}>
          <Text style={styles.instructions}>
            {workoutType === 'strength' 
              ? 'Hold phone firmly while performing exercises' 
              : 'Ensure GPS is enabled for accurate tracking'}
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
            <Text style={styles.buttonText}>START WORKOUT</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007aff',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#555',
    paddingHorizontal: 30,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '80%',
  },
  stopButton: {
    backgroundColor: '#F44336',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  mapContainer: {
    height: 250,
    width: '100%',
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    height: '100%',
    width: '100%',
  },
});