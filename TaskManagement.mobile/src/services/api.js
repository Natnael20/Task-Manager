import axios from 'axios';


const API_BASE_URL = 'http://192.168.1.113:8080/api/tasks';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Calls matching your TaskDto
export const getAllTasks = () => api.get('/all');
export const getTaskById = (id) => api.get(`/${id}`);
export const createTask = (taskData) => api.post('/create', taskData);
export const updateTask = (id, taskData) => api.put(`/update/${id}`, taskData);
export const deleteTask = (id) => api.delete(`/${id}`);

export default api;