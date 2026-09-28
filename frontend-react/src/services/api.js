import axios from 'axios';
import { getAuthToken } from './authService';

const GATEWAY_BASE = 'http://localhost:8082/api';
const DIRECT_BOOKING_BASE = 'http://localhost:8080/api';

// Create API instance
const api = axios.create({
    baseURL: GATEWAY_BASE,
    timeout: 10000
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

// Get all services from booking-service (with fallback)
export const getServices = async () => {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
        const response = await api.get('/services');
        return response.data;
    } catch (gwError) {
        console.warn("Gateway /services failed, trying direct booking service fallback...", gwError);
        try {
            const fbResponse = await axios.get(`${DIRECT_BOOKING_BASE}/services`, { headers, timeout: 8000 });
            return fbResponse.data;
        } catch (directError) {
            console.error("Error fetching services:", directError);
            return [];
        }
    }
};

// Add a new service to booking-service (with fallback)
export const addService = async (serviceData) => {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
        const response = await api.post('/services', serviceData);
        return response.data;
    } catch (gwError) {
        console.warn("Gateway addService failed, trying direct booking service fallback...", gwError);
        try {
            const fbResponse = await axios.post(`${DIRECT_BOOKING_BASE}/services`, serviceData, { headers, timeout: 8000 });
            return fbResponse.data;
        } catch (directError) {
            console.error("Error adding service:", directError);
            throw directError;
        }
    }
};

export default api;
