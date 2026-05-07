import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

export default function ProgressScreen({ route }) {
  const { workoutData } = route.params || {};
  
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43, 50],
    }],
  };

  const monthlyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: [320, 450, 280, 390],
    }],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007aff',
    },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>YOUR PROGRESS</Text>
      
      {workoutData && (
        <View style={styles.recentWorkout}>
          <Text style={styles.sectionTitle}>Last Workout Summary</Text>
          <View style={styles.workoutStats}>
            <View style={styles.workoutStat}>
              <Text style={styles.workoutStatValue}>{workoutData.reps}</Text>
              <Text style={styles.workoutStatLabel}>Reps</Text>
            </View>
            <View style={styles.workoutStat}>
              <Text style={styles.workoutStatValue}>{workoutData.distance.toFixed(2)}</Text>
              <Text style={styles.workoutStatLabel}>Km</Text>
            </View>
            <View style={styles.workoutStat}>
              <Text style={styles.workoutStatValue}>{workoutData.calories}</Text>
              <Text style={styles.workoutStatLabel}>Calories</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        <LineChart
          data={weeklyData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Monthly Comparison</Text>
        <BarChart
          data={monthlyData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisSuffix=""
        />
      </View>

      <View style={styles.personalBests}>
        <Text style={styles.sectionTitle}>Personal Bests</Text>
        <View style={styles.bestItem}>
          <Text style={styles.bestLabel}>Most Reps in a Session:</Text>
          <Text style={styles.bestValue}>120</Text>
        </View>
        <View style={styles.bestItem}>
          <Text style={styles.bestLabel}>Longest Distance:</Text>
          <Text style={styles.bestValue}>8.6 km</Text>
        </View>
        <View style={styles.bestItem}>
          <Text style={styles.bestLabel}>Highest Calories Burned:</Text>
          <Text style={styles.bestValue}>450</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  recentWorkout: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#444',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  workoutStat: {
    alignItems: 'center',
  },
  workoutStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007aff',
  },
  workoutStatLabel: {
    fontSize: 16,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chart: {
    borderRadius: 10,
  },
  personalBests: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  bestLabel: {
    fontSize: 16,
    color: '#555',
  },
  bestValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007aff',
  },
});