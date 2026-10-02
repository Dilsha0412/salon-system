import axios from 'axios';

// Unified API Gateway Auth URL with direct fallback
const GATEWAY_AUTH_URL = 'http://localhost:8082/api/auth';
const DIRECT_AUTH_URL = 'http://localhost:8081/api/auth';

// Helper to extract clean error messages
const extractError = (err) => {
    if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') return err.response.data;
        if (err.response.data.error) return err.response.data.error;
        if (err.response.data.message) return err.response.data.message;
    }
    if (err.message && (err.message.includes('Network Error') || err.code === 'ERR_NETWORK')) {
        return "Network connection error. Please ensure API Gateway or Auth Service is running.";
    }
    return err.message || "An unexpected error occurred.";
};

// User Register Request
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${GATEWAY_AUTH_URL}/register`, userData, { timeout: 8000 });
        if (response.data && response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (gwError) {
        console.warn("Gateway register failed, attempting direct auth fallback...", gwError);
        try {
            const fbResponse = await axios.post(`${DIRECT_AUTH_URL}/register`, userData, { timeout: 8000 });
            if (fbResponse.data && fbResponse.data.token) {
                localStorage.setItem('user', JSON.stringify(fbResponse.data));
                localStorage.setItem('token', fbResponse.data.token);
            }
            return fbResponse.data;
        } catch (directError) {
            throw new Error(extractError(directError));
        }
    }
};

// User Login Request
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${GATEWAY_AUTH_URL}/login`, credentials, { timeout: 8000 });
        if (response.data && response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (gwError) {
        console.warn("Gateway login failed, attempting direct auth fallback...", gwError);
        try {
            const fbResponse = await axios.post(`${DIRECT_AUTH_URL}/login`, credentials, { timeout: 8000 });
            if (fbResponse.data && fbResponse.data.token) {
                localStorage.setItem('user', JSON.stringify(fbResponse.data));
                localStorage.setItem('token', fbResponse.data.token);
            }
            return fbResponse.data;
        } catch (directError) {
            throw new Error(extractError(directError));
        }
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
