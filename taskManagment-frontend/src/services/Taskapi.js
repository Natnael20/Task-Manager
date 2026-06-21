import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/tasks';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Option A: Export as an object directly
const Taskapi = {
    // Get all tasks
    getAllTasks: () => api.get('/all'),
    
    // Get task by ID
    getTaskById: (id) => api.get(`/${id}`),
    
    // Create new task
    createTask: (task) => api.post('/create', task),
    
    // Update task
    updateTask: (id, task) => api.put(`/update/${id}`, task),
    
    // Delete task
    deleteTask: (id) => api.delete(`/${id}`),

    toggleChecklistItem: (taskId, itemId) => 
        api.put(`/tasks/${taskId}/toggle/${itemId}`),
    
    getTaskProgress: (taskId) => 
        api.get(`/tasks/${taskId}/progress`),
};


export default Taskapi;