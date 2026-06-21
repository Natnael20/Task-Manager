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
import DeleteModal from '../../Components/DeleteModal';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { getTaskById, updateTask, deleteTask } from '../../services/api';
import ChecklistAPI from '../../services/Checklistapi';
import NavBar from '../../Components/NavBar';

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
  const [saving, setSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [progress, setProgress] = useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => setMenuVisible(true)}
          style={{ marginRight: 16, padding: 4 }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: '#0b1220',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
      headerTitleContainerStyle: {
        paddingHorizontal: 10,
      },
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchUpdatedTask();
      fetchProgress();
    }, [])
  );

  const fetchUpdatedTask = async () => {
    try {
      setLoading(true);
      const response = await getTaskById(initialTask.id);
      
      console.log('📦 Full task response:', JSON.stringify(response.data, null, 2));
      
      const taskData = response.data;
      
      // Handle both possible field names for checklist
      if (taskData.checklistItems) {
        taskData.checklist = taskData.checklistItems;
      }
      
      setTask(taskData);
      setEditTitle(taskData.title);
      setEditDescription(taskData.description || '');
      setEditStatus(taskData.status || 'PENDING');
      setEditPriority(taskData.priority || 'MEDIUM');
    } catch (error) {
      console.error('Error fetching updated task:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await ChecklistAPI.getTaskProgress(initialTask.id);
      console.log('📊 Progress data:', response.data);
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
      // Fallback: Calculate locally if API fails
      const checklist = task.checklist || [];
      const totalItems = checklist.length;
      const completedItems = checklist.filter(item => item.completed).length;
      const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      setProgress({
        taskId: task.id,
        taskTitle: task.title,
        totalItems: totalItems,
        completedItems: completedItems,
        progressPercentage: progressPercentage,
        status: task.status
      });
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
        checklistItems: task.checklist || [],
      };
      
      await updateTask(task.id, updatedTask);
      setTask(prev => ({ ...prev, title: editTitle.trim() }));
      setIsEditingTitle(false);
      await fetchProgress();
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
        checklistItems: task.checklist || [],
      };
      
      await updateTask(task.id, updatedTask);
      setTask(prev => ({ ...prev, description: editDescription.trim() || null }));
      setIsEditingDescription(false);
      await fetchProgress();
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
      navigation.replace('Home');
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

  // Toggle checklist item using the dedicated API endpoint
  const toggleChecklistItem = async (checklistId) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Use the toggle endpoint from ChecklistAPI
      await ChecklistAPI.toggleChecklistItem(task.id, checklistId);
      
      // Refresh task and progress to get updated data
      await fetchUpdatedTask();
      await fetchProgress();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      Alert.alert('Error', 'Failed to update checklist item');
    }
  };

  // Add new checklist item
  const addChecklistItem = async () => {
    if (!newChecklistItem.trim()) {
      Alert.alert('Error', 'Please enter a checklist item');
      return;
    }

    setIsAddingChecklist(true);
    try {
      const newItem = {
        item: newChecklistItem.trim(),
        completed: false
      };
      
      const updatedChecklist = [...(task.checklist || []), newItem];
      
      const updatedTask = {
        ...task,
        checklistItems: updatedChecklist,
      };
      
      console.log('📤 Sending updated task with new checklist:', JSON.stringify(updatedTask, null, 2));
      
      await updateTask(task.id, updatedTask);
      
      // Refresh task and progress
      await fetchUpdatedTask();
      await fetchProgress();
      
      setNewChecklistItem('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding checklist item:', error);
      Alert.alert('Error', 'Failed to add checklist item');
    } finally {
      setIsAddingChecklist(false);
    }
  };

  // Delete checklist item
  const deleteChecklistItem = async (checklistId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this checklist item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedChecklist = task.checklist.filter(item => item.id !== checklistId);
              const updatedTask = {
                ...task,
                checklistItems: updatedChecklist,
              };
              
              await updateTask(task.id, updatedTask);
              
              // Refresh task and progress
              await fetchUpdatedTask();
              await fetchProgress();
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting checklist item:', error);
              Alert.alert('Error', 'Failed to delete checklist item');
            }
          }
        }
      ]
    );
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
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading...</Text>
        <NavBar navigation={navigation} activeScreen="details" />
      </View>
    );
  }

  // Use progress from API if available, otherwise calculate locally
  const totalItems = progress?.totalItems ?? task.checklist?.length ?? 0;
  const completedItems = progress?.completedItems ?? task.checklist?.filter(item => item.completed).length ?? 0;
  const progressPercentage = progress?.progressPercentage ?? (totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0);
  const checklist = task.checklist || [];

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
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Delete Task</Text>
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
                {task.description || 'No description'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.dueDate}> 
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'No due date'}
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
                      isSelected && styles.priorityOptionSelected
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
                          checklistItems: task.checklist || [],
                        };
                        await updateTask(task.id, updatedTask);
                        setTask(prev => ({ ...prev, priority: level }));
                        await fetchProgress();
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
            <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color + '20' }]}>
              <Ionicons name={statusDisplay.icon} size={16} color={statusDisplay.color} />
              <Text style={[styles.status, { color: statusDisplay.color }]}>
                {statusDisplay.text}
              </Text>
          </View>
        </View>

        {/* Checklist Section */}
        <View style={styles.checklistSection}>
          <View style={styles.checklistHeader}>
            <View style={styles.checklistTitleRow}>
              <Text style={styles.checklistTitle}>Checklist</Text>
              {totalItems > 0 && (
                <Text style={styles.checklistCount}>{totalItems} items</Text>
              )}
            </View>
            
            {totalItems > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    {completedItems}/{totalItems} completed
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {progressPercentage}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${progressPercentage}%`,
                        backgroundColor: progressPercentage === 100 ? '#22C55E' : '#6C63FF'
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>

          {totalItems > 0 ? (
            <View style={styles.checklistItems}>
              {checklist.map((item, index) => (
                <View key={item.id || index} style={styles.checklistItem}>
                  <TouchableOpacity
                    style={styles.checklistItemContent}
                    onPress={() => toggleChecklistItem(item.id)}
                  >
                    <Ionicons 
                      name={item.completed ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={item.completed ? '#7c4dff' : '#888'} 
                    />
                    <Text style={[styles.checklistItemText, item.completed && styles.checklistItemCompleted]}>
                      {item.item}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteChecklistItem}
                    onPress={() => deleteChecklistItem(item.id)}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noChecklistContainer}>
              <Ionicons name="list-outline" size={48} color="#444" />
              <Text style={styles.noChecklistText}>No checklist items</Text>
              <Text style={styles.noChecklistSubtext}>Add items below to track your progress</Text>
            </View>
          )}

          {/* Add Checklist Item */}
          <View style={styles.addChecklistContainer}>
            <TextInput
              style={styles.addChecklistInput}
              value={newChecklistItem}
              onChangeText={setNewChecklistItem}
              placeholder="Add new checklist item..."
              placeholderTextColor="#666"
              editable={!isAddingChecklist}
            />
            <TouchableOpacity
              style={styles.addChecklistButton}
              onPress={addChecklistItem}
              disabled={isAddingChecklist || !newChecklistItem.trim()}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={32} 
                color={newChecklistItem.trim() ? '#6C63FF' : '#898989'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* NavBar */}
      <NavBar navigation={navigation} activeScreen="details" />

      {/* Delete Modal */}
      <DeleteModal
        visible={deleteModalVisible}
        taskToDelete={taskToDelete}
        onClose={() => {
          setDeleteModalVisible(false);
          setTaskToDelete(null);
        }}
        onDelete={handleDelete}
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
    paddingTop: 70,
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
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    padding: 0,
    paddingTop: 20,
    paddingHorizontal: 20,
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
    backgroundColor: '#1a2335',
  },
  priorityOptionSelected: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
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
    top: 60,
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
    minWidth: 150,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
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
  checklistSection: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#1a2335',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#232b45',
  },
  checklistHeader: {
    marginBottom: 16,
  },
  checklistTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffffd3',
  },
  checklistCount: {
    fontSize: 13,
    color: '#ffffffd3',
    fontWeight: '500',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0b1220',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  checklistItems: {
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  checklistItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checklistItemText: {
    fontSize: 15,
    color: '#ffffffd3',
    flex: 1,
  },
  checklistItemCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  deleteChecklistItem: {
    padding: 4,
  },
  noChecklistContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  noChecklistText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  noChecklistSubtext: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
  },
  addChecklistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  addChecklistInput: {
    flex: 1,
    backgroundColor: '#0b1220',
    borderRadius: 8,
    padding: 12,
    color: '#ffffffd3',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#232b45',
  },
  addChecklistButton: {
    padding: 4,
  },
});

export default DetailsScreen;