import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../../Components/NavBar';
import { getAllTasks, deleteTask } from '../../services/api';

const { width, height } = Dimensions.get('window');

const BoardScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getAllTasks();
      
      console.log('📦 Fetched tasks:', response.data.length);
      
      if (Array.isArray(response.data)) {
        setTasks(response.data);
        filterTasks(response.data, activeFilter);
      } else {
        setTasks([]);
        setFilteredTasks([]);
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

  // Filter tasks based on priority
  const filterTasks = (tasksList, filter) => {
    if (filter === 'ALL') {
      setFilteredTasks(tasksList);
    } else {
      const filtered = tasksList.filter(task => task.priority === filter);
      setFilteredTasks(filtered);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    filterTasks(tasks, filter);
    toggleDropdown();
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (dropdownVisible) {
      // Close dropdown
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setDropdownVisible(false));
    } else {
      setDropdownVisible(true);
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 BoardScreen focused, refreshing tasks...');
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

  // Get count for each priority
  const getPriorityCount = (priority) => {
    if (priority === 'ALL') return tasks.length;
    return tasks.filter(task => task.priority === priority).length;
  };

  // Get filter display info - CONSOLIDATED for PRIORITY
  const getFilterDisplay = (filter) => {
    switch(filter) {
      case 'ALL':
        return { text: 'All Tasks', color: '#6C63FF', icon: 'apps' };
      case 'HIGH':
        return { text: 'High', color: '#EF4444', icon: 'flash' };
      case 'MEDIUM':
        return { text: 'Medium', color: '#F59E0B', icon: 'alert-circle' };
      case 'LOW':
        return { text: 'Low', color: '#22C55E', icon: 'leaf' };
      default:
        return { text: 'All Tasks', color: '#6C63FF', icon: 'apps' };
    }
  };

  const dropdownScale = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const dropdownOpacity = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const renderTask = ({ item }) => {
    const checklist = item.checklist || [];
    const totalItems = checklist.length;
    const completedItems = checklist.filter(i => i.completed).length;

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
              { backgroundColor: getPriorityDisplay(item.priority).color + '10' },
              item.status === 'COMPLETED'
            ]}>
              <Ionicons 
                name={getPriorityDisplay(item.priority).icon} 
                size={14} 
                color={getPriorityDisplay(item.priority).color} 
              />
              <Text style={[
                styles.taskPriority,
                { color: getPriorityDisplay(item.priority).color },
                item.status === 'COMPLETED'
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
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
        <NavBar navigation={navigation} activeScreen="board" />
      </View>
    );
  }

  const filterDisplay = getFilterDisplay(activeFilter);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b1220" />
      
      {/* Success Message */}
      {successMessage ? (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
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

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Your Tasks</Text>
          <Text style={styles.title}>Board Overview</Text>
          <Text style={styles.taskCount}>{tasks.length} Total Tasks</Text>
        </View>
        
        {/* Filter Dropdown Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleDropdown}
          activeOpacity={0.8}
        >
          <View style={styles.filterButtonContent}>
            <Ionicons name={filterDisplay.icon} size={18} color={filterDisplay.color} />
            <Text style={[styles.filterButtonText, { color: filterDisplay.color }]}>
              {filterDisplay.text}
            </Text>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="chevron-down" size={18} color={filterDisplay.color} />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {dropdownVisible && (
        <Animated.View 
          style={[
            styles.dropdownContainer,
            {
              opacity: dropdownOpacity,
              transform: [{ scale: dropdownScale }],
            }
          ]}
        >
          {/* All Tasks Option */}
          <TouchableOpacity
            style={[
              styles.dropdownItem,
              activeFilter === 'ALL' && styles.dropdownItemActive,
            ]}
            onPress={() => handleFilterChange('ALL')}
          >
            <View style={styles.dropdownItemLeft}>
              <View style={[styles.dropdownIcon, { backgroundColor: '#6C63FF20' }]}>
                <Ionicons name="apps" size={20} color="#6C63FF" />
              </View>
              <Text style={[
                styles.dropdownItemText,
                activeFilter === 'ALL' && styles.dropdownItemTextActive,
              ]}>
                All Tasks
              </Text>
            </View>
            <View style={styles.dropdownItemRight}>
              <Text style={styles.dropdownItemCount}>{getPriorityCount('ALL')}</Text>
              {activeFilter === 'ALL' && (
                <Ionicons name="checkmark-circle" size={20} color="#6C63FF" />
              )}
            </View>
          </TouchableOpacity>

          {/* High Priority Option */}
          <TouchableOpacity
            style={[
              styles.dropdownItem,
              activeFilter === 'HIGH' && styles.dropdownItemActive,
            ]}
            onPress={() => handleFilterChange('HIGH')}
          >
            <View style={styles.dropdownItemLeft}>
              <View style={[styles.dropdownIcon, { backgroundColor: '#EF444420' }]}>
                <Ionicons name="flash" size={20} color="#EF4444" />
              </View>
              <Text style={[
                styles.dropdownItemText,
                activeFilter === 'HIGH' && styles.dropdownItemTextActive,
              ]}>
                High
              </Text>
            </View>
            <View style={styles.dropdownItemRight}>
              <Text style={[styles.dropdownItemCount, { color: '#EF4444' }]}>
                {getPriorityCount('HIGH')}
              </Text>
              {activeFilter === 'HIGH' && (
                <Ionicons name="checkmark-circle" size={20} color="#EF4444" />
              )}
            </View>
          </TouchableOpacity>

          {/* Medium Priority Option */}
          <TouchableOpacity
            style={[
              styles.dropdownItem,
              activeFilter === 'MEDIUM' && styles.dropdownItemActive,
            ]}
            onPress={() => handleFilterChange('MEDIUM')}
          >
            <View style={styles.dropdownItemLeft}>
              <View style={[styles.dropdownIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              </View>
              <Text style={[
                styles.dropdownItemText,
                activeFilter === 'MEDIUM' && styles.dropdownItemTextActive,
              ]}>
                Medium
              </Text>
            </View>
            <View style={styles.dropdownItemRight}>
              <Text style={[styles.dropdownItemCount, { color: '#F59E0B' }]}>
                {getPriorityCount('MEDIUM')}
              </Text>
              {activeFilter === 'MEDIUM' && (
                <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
              )}
            </View>
          </TouchableOpacity>

          {/* Low Priority Option */}
          <TouchableOpacity
            style={[
              styles.dropdownItem,
              activeFilter === 'LOW' && styles.dropdownItemActive,
            ]}
            onPress={() => handleFilterChange('LOW')}
          >
            <View style={styles.dropdownItemLeft}>
              <View style={[styles.dropdownIcon, { backgroundColor: '#22C55E20' }]}>
                <Ionicons name="leaf" size={20} color="#22C55E" />
              </View>
              <Text style={[
                styles.dropdownItemText,
                activeFilter === 'LOW' && styles.dropdownItemTextActive,
              ]}>
                Low
              </Text>
            </View>
            <View style={styles.dropdownItemRight}>
              <Text style={[styles.dropdownItemCount, { color: '#22C55E' }]}>
                {getPriorityCount('LOW')}
              </Text>
              {activeFilter === 'LOW' && (
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <FlatList
        data={filteredTasks}
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
            <Text style={styles.emptyText}>
              {activeFilter === 'ALL' ? 'No tasks yet' : `No ${activeFilter.toLowerCase()} priority tasks`}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'ALL' 
                ? 'Create your first task to get started' 
                : `Try changing the filter to see other tasks`}
            </Text>
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

      {/* NavBar */}
      <NavBar navigation={navigation} activeScreen="board" />
    </View>
  );
};

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
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 10,
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 10,
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 110,
    paddingBottom: 10,
    backgroundColor: '#0b1220',
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
    marginBottom: 6,
  },
  taskCount: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
  },
  // Filter Dropdown Button
  filterButton: {
    paddingBottom: 8,
    marginTop: -4,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1a2335',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#232b45',
    gap: 4,
    alignSelf: 'flex-end',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Dropdown Menu
  dropdownContainer: {
    position: 'absolute',
    top: 160,
    left: 20,
    right: 20,
    backgroundColor: '#1a2335',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#232b45',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 2,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#ADB5BD',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dropdownItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownItemCount: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  resultCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: '#0b1220',
  },
  resultCountText: {
    fontSize: 12,
    color: '#6C757D',
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    marginTop: 20,
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
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 36,
    marginTop: 4,
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
    bottom: 80,
    right: 20,
    backgroundColor: '#0b1220',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
});

export default BoardScreen;