import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../../Components/NavBar';
import { getAllTasks } from '../../services/api';

function Tasks({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getAllTasks();
      
      console.log('📦 Fetched tasks:', response.data.length);
      
      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
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
              size={20} 
              color={getStatusDisplay(item.status).color} 
            />
            <Text style={[styles.taskTitle, item.status === 'COMPLETED' && styles.completedText]}>
              {item.title || 'Untitled'}
            </Text>
          </View>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityDisplay(item.priority).color + '20' }
          ]}>
            <Ionicons 
              name={getPriorityDisplay(item.priority).icon} 
              size={12} 
              color={getPriorityDisplay(item.priority).color} 
            />
            <Text style={[
              styles.taskPriority,
              { color: getPriorityDisplay(item.priority).color }
            ]}>
              {getPriorityDisplay(item.priority).text}
            </Text>
          </View>
        </View>
        
        {item.description ? (
          <Text 
            style={[styles.taskDescription, item.status === 'COMPLETED' && styles.completedText]}
            numberOfLines={2}
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
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
        <NavBar navigation={navigation} activeScreen="allTasks" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b1220" />
      
      {/* Error Message */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#f44336" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>All Tasks</Text>
        <Text style={styles.taskCount}>{tasks.length} Total Tasks</Text>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6C63FF" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle" size={60} color="#666" />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Create your first task to get started</Text>
          </View>
        }
      />

      {/* NavBar */}
      <NavBar navigation={navigation} activeScreen="allTasks" />
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#0b1220',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffffd3',
  },
  taskCount: {
    fontSize: 13,
    color: '#6C63FF',
    marginTop: 4,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
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
    marginLeft: 30,
    marginBottom: 12,
    lineHeight: 18,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 30,
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
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  taskPriority: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
});

export default Tasks;