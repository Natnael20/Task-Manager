// src/screens/CreateScreen.js
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTask } from '../../services/api';

function CreateScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState('PENDING');
  const [priority, setPriority] = useState('MEDIUM');
  const [checklistItems, setChecklistItems] = useState(['']); // Start with one empty item
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getPriorityDisplay = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'LOW':
        return { text: 'Low', color: '#22C55E', bgColor: '#DCFCE7', icon: 'leaf-outline', iconColor: '#22C55E'};
      case 'MEDIUM':
        return { text: 'Medium', color: '#F59E0B', bgColor: '#FEF3C7', icon: 'alert-circle-outline', iconColor: '#F59E0B'};
      case 'HIGH':
        return { text: 'High', color: '#EF4444', bgColor: '#FEE2E2', icon: 'flash-outline', iconColor: '#EF4444'};
      default:
        return { text: priority || 'Unknown', color: '#6B7280', bgColor: '#F3F4F6', icon: 'help-circle-outline', iconColor: '#6B7280'};
    }
  };

  // Add a new checklist item
  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, '']);
  };

  // Remove a checklist item
  const removeChecklistItem = (index) => {
    const newItems = checklistItems.filter((_, i) => i !== index);
    setChecklistItems(newItems.length > 0 ? newItems : ['']); // Keep at least one empty
  };

  // Update a checklist item
  const updateChecklistItem = (index, value) => {
    const newItems = [...checklistItems];
    newItems[index] = value;
    setChecklistItems(newItems);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('Please enter a task title');
      setTimeout(() => setErrorMessage(''), 7000);
      return;
    }

    // Filter out empty checklist items
    const filteredChecklist = checklistItems.filter(item => item.trim() !== '');

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        status: status,
        priority: priority,
        dueDate: dueDate.toISOString().split('T')[0],
        checklistItems: filteredChecklist.map(item => ({ 
          item: item.trim(), 
          completed: false 
        }))
      };
      
      console.log('📤 Creating task with data:', JSON.stringify(taskData, null, 2));
      const response = await createTask(taskData);
      console.log('✅ Task created:', response.data);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '✅ Success', 
        `Task "${title}" created successfully!\n\n📋 Checklist items: ${filteredChecklist.length}`,
        [
          { 
            text: 'View Task', 
            onPress: () => navigation.replace('Board') 
          },
          { 
            text: 'Create Another', 
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setDueDate(new Date());
              setStatus('PENDING');
              setPriority('MEDIUM');
              setChecklistItems(['']);
              setLoading(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error creating task:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        '❌ Error', 
        'Failed to create task. Please check:\n\n• Your internet connection\n• Backend server is running\n• Data is valid'
      );
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create New Task</Text>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={20} color="#f44336" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>
            Title <Text style={styles.asterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            placeholderTextColor="#666"
            editable={!loading}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            editable={!loading}
          />

          {/* Due Date */}
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => setShowDatePicker(true)}
            disabled={loading}
          >
            <Ionicons name="calendar" size={20} color="#ffffffd3" />
            <Text style={styles.dateText}>
              {dueDate.toLocaleDateString('en-US', { 
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}

          {/* Priority Section */}
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {['LOW', 'MEDIUM', 'HIGH'].map((level) => {
              const priorityDisplay = getPriorityDisplay(level);
              const isSelected = priority === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.priorityButton,
                    isSelected && styles.prioritySelected
                  ]}
                  onPress={() => setPriority(level)}
                  disabled={loading}
                >
                  <Ionicons 
                    name={priorityDisplay.icon} 
                    size={16} 
                    color={isSelected ? priorityDisplay.iconColor : '#666'} 
                  />
                  <Text style={[
                    styles.priorityText,
                    { color: isSelected ? priorityDisplay.color : '#666' }
                  ]}>
                    {priorityDisplay.text}
                  </Text>
                  {isSelected && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color={priorityDisplay.color} 
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Status Section */}
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'PENDING' && styles.statusSelectedPending,
              ]}
              onPress={() => setStatus('PENDING')}
              disabled={loading}
            >
              <Ionicons name="radio-button-off" size={16} color="#ffffffd3" />
              <Text style={styles.statusText}>PENDING</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'IN_PROGRESS' && styles.statusSelectedProgress,
              ]}
              onPress={() => setStatus('IN_PROGRESS')}
              disabled={loading}
            >
              <Ionicons name="time" size={16} color="#ffffffd3" />
              <Text style={styles.statusText}>IN PROGRESS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statusButton,
                status === 'COMPLETED' && styles.statusSelectedCompleted,
              ]}
              onPress={() => setStatus('COMPLETED')}
              disabled={loading}
            >
              <Ionicons name="checkmark-circle" size={16} color="#ffffffd3" />
              <Text style={styles.statusText}>COMPLETED</Text>
            </TouchableOpacity>
          </View>

          {/* Checklist Section */}
          <Text style={styles.label}>Checklist</Text>
          <View style={styles.checklistContainer}>
            {checklistItems.map((item, index) => (
              <View key={index} style={styles.checklistItemRow}>
                <View style={styles.checklistNumber}>
                  <Text style={styles.checklistNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={styles.checklistInput}
                  value={item}
                  onChangeText={(value) => updateChecklistItem(index, value)}
                  placeholder={`Checklist item ${index + 1}`}
                  placeholderTextColor="#666"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.removeChecklistButton}
                  onPress={() => removeChecklistItem(index)}
                  disabled={loading}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.addChecklistButton}
              onPress={addChecklistItem}
              disabled={loading}
            >
              <Ionicons name="add-circle" size={24} color="#6C63FF" />
              <Text style={styles.addChecklistText}>Add Checklist Item</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons - Moved to bottom with fixed positioning */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.submitButton]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.buttonText}>
                {loading ? 'Creating...' : 'Create Task'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Extra space at bottom for better scrolling */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffffd3',
    textAlign: 'center',
  },
  asterisk: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#ffffffd3',
  },
  input: {
    backgroundColor: '#1a2335',
    borderWidth: 1,
    borderColor: '#232b45',
    padding: 12,
    borderRadius: 8,
    color: '#ffffffd3',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2335',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2335',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#232b45',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffffd3',
  },
  // Priority Styles
  priorityContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#1a2335',
    borderWidth: 1,
    borderColor: '#232b45',
  },
  prioritySelected: {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Status Styles
  statusContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: '#1a2335',
    borderWidth: 1,
    borderColor: '#232b45',
  },
  statusSelectedPending: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  statusSelectedProgress: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  statusSelectedCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffffd3',
  },
  // Checklist Styles
  checklistContainer: {
    marginBottom: 20,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  checklistNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checklistInput: {
    flex: 1,
    backgroundColor: '#1a2335',
    borderWidth: 1,
    borderColor: '#232b45',
    padding: 12,
    borderRadius: 8,
    color: '#ffffffd3',
    fontSize: 14,
  },
  removeChecklistButton: {
    padding: 4,
  },
  addChecklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#232b45',
    borderStyle: 'dashed',
    justifyContent: 'center',
    gap: 8,
  },
  addChecklistText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // Button Container - Fixed at bottom
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 25,
    marginBottom: 10,
    paddingVertical: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
  },
  cancelButton: {
    backgroundColor: '#1a2335',
    borderWidth: 1,
    borderColor: '#232b45',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default CreateScreen;