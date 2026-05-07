import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import GymLocatorScreen from '../screens/GymLocatorScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'FitTrack Pro' }}
      />
      <Stack.Screen 
        name="Workout" 
        component={WorkoutScreen} 
        options={{ title: 'Workout' }}
      />
      <Stack.Screen 
        name="Progress" 
        component={ProgressScreen} 
        options={{ title: 'Your Progress' }}
      />
      <Stack.Screen 
        name="GymLocator" 
        component={GymLocatorScreen} 
        options={{ title: 'Find Gyms' }}
      />
    </Stack.Navigator>
  );
}