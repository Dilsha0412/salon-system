import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api/services";

// Get all services from backend
export const getServices = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
};

// Add a new service to backend
export const addService = async (serviceData) => {
    try {
        const response = await axios.post(API_BASE_URL, serviceData);
        return response.data;
    } catch (error) {
        console.error("Error adding service:", error);
        throw error;
    }
};