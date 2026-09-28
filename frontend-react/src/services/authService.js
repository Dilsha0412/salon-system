import axios from 'axios';

// Unified API Gateway Auth URL
const AUTH_API_URL = 'http://localhost:8082/api/auth';

// Helper to extract clean error messages
const extractError = (err) => {
    if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') return err.response.data;
        if (err.response.data.error) return err.response.data.error;
        if (err.response.data.message) return err.response.data.message;
    }
    if (err.message && err.message.includes('Network Error')) {
        return "Network connection error. Please ensure API Gateway (Port 8082) is running.";
    }
    return err.message || "An unexpected error occurred.";
};

// User Register Request
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/register`, userData);
        if (response.data && response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw new Error(extractError(error));
    }
};

// User Login Request
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
        if (response.data && response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw new Error(extractError(error));
    }
};

// User Logout
export const logoutUser = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
};

export const getAuthToken = () => {
    return localStorage.getItem('token');
};
