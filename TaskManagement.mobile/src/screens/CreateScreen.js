import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTask } from '../services/api';

function CreateScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState('PENDING');
  const [priority, setPriority] = useState('MEDIUM'); // Added priority state
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('Please enter a task title');
      setTimeout(() => setErrorMessage(''), 7000);
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        status: status,
        priority: priority, // Added priority to task data
        dueDate: dueDate.toISOString().split('T')[0],
      };
      
      console.log('Creating task:', taskData);
      await createTask(taskData);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `Task "${title}" created successfully!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to create task. Check your connection.');
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
    <ScrollView style={styles.container}>
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
      />

      {/* Due Date */}
      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity 
        style={styles.dateButton} 
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar" size={20} color="#ffffffd3" />
        <Text style={styles.dateText}>
          {dueDate.toLocaleDateString()}
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
                isSelected
              ]}
              onPress={() => setPriority(level)}
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
        >
          <Ionicons name="checkmark-circle" size={16} color="#ffffffd3" />
          <Text style={styles.statusText}>COMPLETED</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
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

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close-circle" size={24} color="white" />
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0b1220',
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
    borderWidth: 1,
    borderColor: 'transparent',
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
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 10,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 10,
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
    borderWidth: 2,
    borderColor: 'transparent',
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
  },
  statusSelectedPending: {
    backgroundColor: '#f44336',
  },
  statusSelectedProgress: {
    backgroundColor: '#FF9800',
  },
  statusSelectedCompleted: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffffd3',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    marginBottom: 90,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitButton: {
    backgroundColor: '#121a2b',
  },
  cancelButton: {
    backgroundColor: '#121a2b',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CreateScreen;