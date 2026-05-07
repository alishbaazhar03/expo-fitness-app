import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FitTrack Pro</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Workout', { workoutType: 'strength' })}
      >
        <Text style={styles.buttonText}>Strength Training</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Workout', { workoutType: 'running' })}
      >
        <Text style={styles.buttonText}>Running</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Workout', { workoutType: 'cycling' })}
      >
        <Text style={styles.buttonText}>Cycling</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.gymButton}
        onPress={() => navigation.navigate('GymLocator')}
      >
        <Text style={styles.buttonText}>Find Nearby Gyms</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    backgroundColor: '#007aff',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    marginVertical: 10,
    alignItems: 'center',
  },
  gymButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});