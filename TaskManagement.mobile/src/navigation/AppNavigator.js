import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens from src/screens
import HomeScreen from '../screens/HomeScreen';
import BoardScreen from '../screens/Task/BoardScreen';
import CreateScreen from '../screens/Task/CreateScreen';
import DetailsScreen from '../screens/Task/DetailsScreen';
import TaskScreen from  '../screens/Task/TasksScreen';

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
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // Remove back button from all screens
          headerLeft: () => null,
          // Make header transparent so NavBar can be at top left
          headerTransparent: true,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: () => <SoftwareTitle />,
            // Remove header back button for Home
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="Board"
          component={BoardScreen}
          options={{
            // Hide the title completely
            headerTitle: '',
            // Remove back button
            headerLeft: () => null,
            // Make header transparent
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="Create"
          component={CreateScreen}
          options={{
            headerTitle: '',
            headerLeft: () => null,
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{
            headerTitle: '',
            headerLeft: () => null,
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="Tasks"
          component={TaskScreen}
          options={{
            headerTitle: '',
            headerLeft: () => null,
            headerTransparent: true,
          }}
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