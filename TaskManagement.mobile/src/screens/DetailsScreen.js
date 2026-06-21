import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import DeleteModal from '../component/DeleteModal';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { getTaskById, updateTask, deleteTask } from '../services/api';

function DetailsScreen({ navigation, route }) {
  const { task: initialTask } = route.params;
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority || 'MEDIUM');
  const [editStatus, setEditStatus] = useState(task.status || 'PENDING');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => setMenuVisible(true)}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#0b1220',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '600',
      },
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchUpdatedTask();
    }, [])
  );

  const fetchUpdatedTask = async () => {
    try {
      setLoading(true);
      const response = await getTaskById(initialTask.id);
      setTask(response.data);
      setEditTitle(response.data.title);
      setEditDescription(response.data.description || '');
      setEditStatus(response.data.status || 'PENDING');
      setEditPriority(response.data.priority || 'MEDIUM');
    } catch (error) {
      console.error('Error fetching updated task:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTitle = async () => {
    if (!editTitle.trim()) {
      setEditTitle(task.title);
      setIsEditingTitle(false);
      return;
    }
    
    setSaving(true);
    try {
      const updatedTask = {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        priority: task.priority,
        status: task.status,
      };
      
      await updateTask(task.id, updatedTask);
      setTask(prev => ({ ...prev, title: editTitle.trim() }));
      setIsEditingTitle(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update title');
      setEditTitle(task.title);
    } finally {
      setSaving(false);
    }
  };

  const saveDescription = async () => {
    setSaving(true);
    try {
      const updatedTask = {
        title: task.title,
        description: editDescription.trim() || null,
        priority: task.priority,
        status: task.status,
      };
      
      await updateTask(task.id, updatedTask);
      setTask(prev => ({ ...prev, description: editDescription.trim() || null }));
      setIsEditingDescription(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update description');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    
    setIsDeleting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    try {
      await deleteTask(taskToDelete.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDeleteModalVisible(false);
      // Navigate to Home after successful deletion
      navigation.replace('Home'); // This replaces the current screen with Home
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to delete task');
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  const confirmDelete = () => {
    setMenuVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTaskToDelete({ id: task.id, title: task.title });
    setDeleteModalVisible(true);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    setIsEditingTitle(true);
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
    switch(status) {
      case 'COMPLETED':
        return { text: 'Completed', color: '#4CAF50', icon: 'checkmark-circle' };
      case 'IN_PROGRESS':
        return { text: 'In Progress', color: '#FF9800', icon: 'time' };
      case 'PENDING':
        return { text: 'Pending', color: '#f44336', icon: 'radio-button-off' };
      default:
        return { text: status || 'Unknown', color: '#888', icon: 'alert-circle' };
    }
  };

  const statusDisplay = getStatusDisplay(isEditingStatus ? editStatus : task.status);

  if (loading && !isEditingTitle && !isEditingDescription && !isEditingPriority && !isEditingStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0b1220" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Three Dots Menu Dropdown */}
      {menuVisible && (
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={confirmDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        
        {/* Title */}
        <View style={styles.section}>
          {isEditingTitle ? (
            <TextInput
              style={styles.titleInput}
              value={editTitle}
              onChangeText={setEditTitle}
              onBlur={saveTitle}
              placeholder="Enter task title"
              placeholderTextColor="#666"
              autoFocus
              multiline
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
              <Text style={styles.title}>{task.title}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          {isEditingDescription ? (
            <TextInput
              style={styles.descriptionInput}
              value={editDescription}
              onChangeText={setEditDescription}
              onBlur={saveDescription}
              placeholder="Enter description"
              placeholderTextColor="#666"
              multiline
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingDescription(true)}>
              <Text style={styles.description}>
                {task.description}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
           <Text style={styles.dueDate}> 
                {task.dueDate}
            </Text>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          {isEditingPriority ? (
            <View style={styles.priorityOptions}>
              {['LOW', 'MEDIUM', 'HIGH'].map((level) => {
                const priority = getPriorityDisplay(level);
                const isSelected = editPriority === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.priorityOption,
                      isSelected
                    ]}
                    onPress={async () => {
                      setEditPriority(level);
                      setIsEditingPriority(false);
                      setSaving(true);
                      try {
                        const updatedTask = {
                          title: task.title,
                          description: task.description || null,
                          priority: level,
                          status: task.status,
                        };
                        await updateTask(task.id, updatedTask);
                        setTask(prev => ({ ...prev, priority: level }));
                      } catch (error) {
                        Alert.alert('Error', 'Failed to update priority');
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    <Ionicons 
                      name={priority.icon} 
                      size={20} 
                      color={priority.color} 
                    />
                    <Text style={[styles.priorityOptionText, { color: priority.color }]}>
                      {priority.text}
                    </Text>
                    {isSelected && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={priority.color} 
                        style={styles.checkmark}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.priorityDisplay}
              onPress={() => {
                setEditPriority(task.priority || 'MEDIUM');
                setIsEditingPriority(true);
              }}
            >
              {task.priority ? (
                <>
                  <Ionicons 
                    name={getPriorityDisplay(task.priority).icon} 
                    size={20} 
                    color={getPriorityDisplay(task.priority).color} 
                  />
                  <Text style={[styles.priorityText, { color: getPriorityDisplay(task.priority).color }]}>
                    {getPriorityDisplay(task.priority).text}
                  </Text>
                </>
              ) : (
                <Text style={styles.placeholder}>Select priority</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          {isEditingStatus ? (
            <View style={styles.editStatusContainer}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  editStatus === 'PENDING' && styles.statusOptionPending,
                ]}
                onPress={async () => {
                  setEditStatus('PENDING');
                  setIsEditingStatus(false);
                  setSaving(true);
                  try {
                    const updatedTask = {
                      title: task.title,
                      description: task.description || null,
                      priority: task.priority,
                      status: 'PENDING',
                    };
                    await updateTask(task.id, updatedTask);
                    setTask(prev => ({ ...prev, status: 'PENDING' }));
                  } catch (error) {
                    Alert.alert('Error', 'Failed to update status');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Ionicons name="radio-button-off" size={16} color="#fff" />
                <Text style={styles.statusOptionText}>Pending</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  editStatus === 'IN_PROGRESS' && styles.statusOptionProgress,
                ]}
                onPress={async () => {
                  setEditStatus('IN_PROGRESS');
                  setIsEditingStatus(false);
                  setSaving(true);
                  try {
                    const updatedTask = {
                      title: task.title,
                      description: task.description || null,
                      priority: task.priority,
                      status: 'IN_PROGRESS',
                    };
                    await updateTask(task.id, updatedTask);
                    setTask(prev => ({ ...prev, status: 'IN_PROGRESS' }));
                  } catch (error) {
                    Alert.alert('Error', 'Failed to update status');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Ionicons name="time" size={16} color="#fff" />
                <Text style={styles.statusOptionText}>In Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  editStatus === 'COMPLETED' && styles.statusOptionCompleted,
                ]}
                onPress={async () => {
                  setEditStatus('COMPLETED');
                  setIsEditingStatus(false);
                  setSaving(true);
                  try {
                    const updatedTask = {
                      title: task.title,
                      description: task.description || null,
                      priority: task.priority,
                      status: 'COMPLETED',
                    };
                    await updateTask(task.id, updatedTask);
                    setTask(prev => ({ ...prev, status: 'COMPLETED' }));
                  } catch (error) {
                    Alert.alert('Error', 'Failed to update status');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.statusOptionText}>Completed</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => {
              setEditStatus(task.status || 'PENDING');
              setIsEditingStatus(true);
            }}>
              <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color + '20' }]}>
                <Ionicons name={statusDisplay.icon} size={16} color={statusDisplay.color} />
                <Text style={[styles.status, { color: statusDisplay.color }]}>
                  {statusDisplay.text}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        {/* Extra bottom padding for better scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Delete Modal */}
      <DeleteModal
        visible={deleteModalVisible}
        taskToDelete={taskToDelete}
        onClose={() => {
          setDeleteModalVisible(false);
          setTaskToDelete(null);
        }}
        onDelete={async () => {
          await handleDelete();
          navigation.replace('Home'); // Navigate after delete
        }}
        isDeleting={isDeleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b1220',
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffffd3',
    fontSize: 16,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 10,
    gap: 5,
  },
  savingText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    padding: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#ffffffd3',
    lineHeight: 24,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#ffffffd3',
    lineHeight: 24,
    padding: 0,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    alignSelf: 'flex-start',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  editStatusContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#121a2b',
    gap: 6,
  },
  statusOptionPending: {
    backgroundColor: '#f44336',
  },
  statusOptionProgress: {
    backgroundColor: '#FF9800',
  },
  statusOptionCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusOptionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dueDate: {
    fontSize: 16,
    color: '#b9b6b6d3',
  },
  dateButton: {
    backgroundColor: '#1a2335',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#ffffffd3',
  },
  priorityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  priorityText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkmark: {
    marginLeft: 4,
  },
  placeholder: {
    color: '#888',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 12,
    backgroundColor: '#1a2335',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#2a3448',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a3448',
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  menuItemDanger: {
    color: '#EF4444',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DetailsScreen;