import React from 'react';
import { View, Text, StyleSheet} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens from src/screens
import HomeScreen from '../screens/HomeScreen';
import CreateScreen from '../screens/CreateScreen';
import DetailsScreen from '../screens/DetailsScreen';

const Stack = createStackNavigator();


function SoftwareTitle() {
  return (
    <View style={styles.container}>
      <Text style={styles.taskText}>Task</Text>
      <Text style={styles.managerText}>Flow</Text>
    </View>
  );
}


function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0b1220',
          },
          headerTintColor: '#fff',
        }}
        >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: () => <SoftwareTitle />,
          }}
        />
        <Stack.Screen
          name="Create"
          component={CreateScreen}
          options={{ title: 'Create Task' }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: 'Task Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  taskText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  managerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#aaa',
  },
});

export default AppNavigator;