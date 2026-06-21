import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllTasks, deleteTask } from '../services/api';

function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getAllTasks();
      
      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('Cannot connect to backend');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };


  const getPriorityDisplay = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'LOW':
        return { text: 'Low', color: '#22C55E', icon: 'leaf-outline'};
      case 'MEDIUM':
        return { text: 'Medium', color: '#F59E0B', icon: 'alert-circle-outline'};
      case 'HIGH':
        return { text: 'High', color: '#EF4444', icon: 'flash-outline'};
      default:
        return { text: priority || 'Unknown', color: '#6B7280', icon: 'help-circle-outline'};
    }
  };


  const getStatusDisplay = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED':
        return { text: 'Completed', color: '#22C55E', icon: 'checkmark-done-circle'};
      case 'IN_PROGRESS':
        return { text: 'In Progress', color: '#F59E0B', icon: 'time'};
      case 'PENDING':
        return { text: 'Pending', color: '#EF4444', icon: 'radio-button-off'};
      default:
        return { text: status || 'Unknown', color: '#6B7280', icon: 'alert-circle-outline'};
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const renderTask = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[styles.taskCard, item.status === 'COMPLETED' && styles.completedCard]}
        onPress={() => navigation.navigate('Details', { task: item })}
      >
        <View style={styles.taskHeader}>
          <View style={styles.titleContainer}>
            <Ionicons 
              name={getStatusDisplay(item.status).icon} 
              size={24} 
              color={getStatusDisplay(item.status).color} 
            />
            <Text style={[styles.taskTitle, item.status === 'COMPLETED' && styles.completedText]}>
              {item.title || 'Untitled'}
            </Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityDisplay(item.priority).color + '20' },
              item.status === 'COMPLETED' && styles.completedBadge
            ]}>
              <Ionicons 
                name={getPriorityDisplay(item.priority).icon} 
                size={14} 
                color={getPriorityDisplay(item.priority).color} 
              />
              <Text style={[
                styles.taskPriority,
                { color: getPriorityDisplay(item.priority).color },
                item.status === 'COMPLETED' && styles.completedText
              ]}>
                {getPriorityDisplay(item.priority).text}
              </Text>
            </View>
          </View>
        </View>
        
        {item.description ? (
          <Text 
            style={[styles.taskDescription, item.status === 'COMPLETED' && styles.completedText]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.description}
          </Text>
        ) : null}
        
        <View style={styles.taskFooter}>
          <View style={styles.statusBadge}>
            <Ionicons name="calendar-outline" size={12} color="#888" />
            <Text style={styles.dueDateText}>{formatDate(item.dueDate)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusDisplay(item.status).color + '20' }]}>
            <Ionicons name={getStatusDisplay(item.status).icon} size={12} color={getStatusDisplay(item.status).color} />
            <Text style={[styles.statusText, { color: getStatusDisplay(item.status).color }]}>
              {item.status || 'PENDING'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a2335" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Success Message */}
      {successMessage ? (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#1a2335" />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}
      
      {/* Error Message */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#f44336" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome Back!</Text>
        <Text style={styles.title}>Ready To Get Started!</Text>
        <Text style={styles.taskCount}>{tasks.length} Total Tasks</Text>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4CAF50" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle" size={60} color="#666" />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first task</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Create')}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={25} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b1220',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2335',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 10,
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2335',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 10,
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  welcome: {
    fontSize: 13,
    color: '#ffffffd3',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffffd3',
    marginBottom: 10,
  },
  taskCount: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#1a2335',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#232b45',
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#0f1728',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffffd3',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskDescription: {
    fontSize: 13,
    color: '#888',
    marginLeft: 36,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 36,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0b1220',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dueDateText: {
    fontSize: 11,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#1a2335',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#1a2335',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
   priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  taskPriority: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedText: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  completedBadge: {
    opacity: 0.5,
  },
});
export default HomeScreen;