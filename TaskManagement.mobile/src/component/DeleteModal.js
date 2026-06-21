import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { deleteTask } from '../services/api';

const DeleteModal = ({ 
  visible, 
  taskToDelete, 
  onClose, 
  onDeleteSuccess,
  navigation,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!taskToDelete) return;
    
    setIsDeleting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    try {
      await deleteTask(taskToDelete.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      if (navigation) {
        navigation.replace('Home');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.modalIcon}>
            <Ionicons name="trash-outline" size={48} color="#EF4444" />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>Delete Task</Text>

          {/* Message */}
          <Text style={styles.modalMessage}>
            Are you sure you want to delete "{taskToDelete?.title || 'this task'}"? 
            This action cannot be undone.
          </Text>

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalDeleteButton]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a2335',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalCancelButton: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#2a3448',
  },
  modalDeleteButton: {
    backgroundColor: '#EF4444',
  },
  modalCancelText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeleteModal;