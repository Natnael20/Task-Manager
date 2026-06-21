// src/services/Checklistapi.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.214:8080/api';

const Checklist = {
    // Toggle a checklist item
    toggleChecklistItem: async (taskId, checklistId) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/checklists/task/${taskId}/item/${checklistId}/toggle`
            );
            return response;
        } catch (error) {
            console.error('Error toggling checklist item:', error);
            throw error;
        }
    },

    // Get task progress
    getTaskProgress: async (taskId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/checklists/task/${taskId}/progress`
            );
            return response;
        } catch (error) {
            console.error('Error fetching task progress:', error);
            throw error;
        }
    },

};

export default Checklist;