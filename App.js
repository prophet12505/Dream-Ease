import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from './Screens/HomeScreen';
import SettingsScreen from './Screens/SettingsScreen';
import RecordScreen from './Screens/RecordScreen';
import SelectCoverNoiseScreen from './Screens/SelectCoverNoiseScreen'; // <-- Import new screen
import SuccessfulForgingHypnoScreen from './Screens/SuccessfulForgingHypnoScreen';

const Stack = createStackNavigator();


const Tab = createBottomTabNavigator();
function RecordStack() {
  return (
    <Stack.Navigator initialRouteName="RecordScreen">
      <Stack.Screen name="RecordScreen" component={RecordScreen} />
      <Stack.Screen name="SelectCoverNoiseScreen" component={SelectCoverNoiseScreen} />
      <Stack.Screen name="SuccessfulForgingHypnoScreen" component={SuccessfulForgingHypnoScreen} />
    </Stack.Navigator>
  );
}
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'barcode' : 'barcode-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'Record') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Record" component={RecordStack} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}