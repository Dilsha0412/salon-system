import axios from 'axios';

const AUTH_API_URL = 'http://localhost:8081/api/auth';

//  User Register Request
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/register`, userData);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Registration failed");
    }
};

//  User Login Request
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Login failed");
    }
};

//  User Logout
export const logoutUser = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

export const getAuthToken = () => {
    return localStorage.getItem('token');
};
