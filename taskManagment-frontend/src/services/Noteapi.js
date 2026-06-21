import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/notes';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Option A: Export as an object directly
const Noteapi = {
    // Get all tasks
    getAllNotes: () => api.get('/all'),
    
    // Get task by ID
    getNotesById: (id) => api.get(`/${id}`),
    
    // Create new task
    createNote: (task) => api.post('/create', task),
        
    // Delete task
    deleteNote: (id) => api.delete(`/${id}`),
};

export default Noteapi;