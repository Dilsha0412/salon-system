import axios from 'axios';
import { getAuthToken } from './authService';

const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

// Attach JWT Token to every outgoing request
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Get all services from booking-service
export const getServices = async () => {
    try {
        const response = await api.get('/services');
        return response.data;
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
};

// Add a new service to booking-service
export const addService = async (serviceData) => {
    try {
        const response = await api.post('/services', serviceData);
        return response.data;
    } catch (error) {
        console.error("Error adding service:", error);
        throw error;
    }
};

export default api;
