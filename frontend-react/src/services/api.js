import axios from 'axios';
import { getAuthToken } from './authService';

const GATEWAY_BASE = 'http://localhost:8082/api';
const DIRECT_BOOKING_BASE = 'http://localhost:8083/api';
const LOCAL_BOOKING_BASE = 'http://localhost:8080/api';

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

// Helper for direct fallback requests
const fetchWithFallback = async (requestFn, fallbackPath, method = 'GET', data = null) => {
    try {
        return await requestFn();
    } catch (gwError) {
        // If server actually responded with a status code (e.g. 400, 401, 403, 409, 500), don't blindly re-send mutating requests
        if (gwError.response && ['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
            throw gwError;
        }

        console.warn(`Gateway request failed for ${fallbackPath}, trying direct fallback...`, gwError?.message);
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const url = `${DIRECT_BOOKING_BASE}${fallbackPath}`;
            const res = await axios({ method, url, data, headers, timeout: 8000 });
            return res.data;
        } catch (fbError) {
            try {
                const localUrl = `${LOCAL_BOOKING_BASE}${fallbackPath}`;
                const resLocal = await axios({ method, url: localUrl, data, headers, timeout: 8000 });
                return resLocal.data;
            } catch (finalError) {
                console.error(`Final fallback failed for ${fallbackPath}:`, finalError);
                throw finalError;
            }
        }
    }
};

// ================= SERVICES =================

export const getServices = async () => {
    return await fetchWithFallback(
        async () => {
            const res = await api.get('/services');
            return res.data;
        },
        '/services'
    ).catch(() => []);
};

export const addService = async (serviceData) => {
    return await fetchWithFallback(
        async () => {
            const res = await api.post('/services', serviceData);
            return res.data;
        },
        '/services',
        'POST',
        serviceData
    );
};

export const updateService = async (id, serviceData) => {
    return await fetchWithFallback(
        async () => {
            const res = await api.put(`/services/${id}`, serviceData);
            return res.data;
        },
        `/services/${id}`,
        'PUT',
        serviceData
    );
};

export const deleteService = async (id) => {
    return await fetchWithFallback(
        async () => {
            const res = await api.delete(`/services/${id}`);
            return res.data;
        },
        `/services/${id}`,
        'DELETE'
    );
};

// ================= STYLISTS =================

export const getStylists = async () => {
    return await fetchWithFallback(
        async () => {
            const res = await api.get('/stylists');
            return res.data;
        },
        '/stylists'
    ).catch(() => []);
};

export const addStylist = async (stylistData) => {
    return await fetchWithFallback(
        async () => {
            const res = await api.post('/stylists', stylistData);
            return res.data;
        },
        '/stylists',
        'POST',
        stylistData
    );
};

export const updateStylist = async (id, stylistData) => {
    return await fetchWithFallback(
        async () => {
            const res = await api.put(`/stylists/${id}`, stylistData);
            return res.data;
        },
        `/stylists/${id}`,
        'PUT',
        stylistData
    );
};

export const deleteStylist = async (id) => {
    return await fetchWithFallback(
        async () => {
            const res = await api.delete(`/stylists/${id}`);
            return res.data;
        },
        `/stylists/${id}`,
        'DELETE'
    );
};

// ================= BOOKINGS / APPOINTMENTS =================

export const getAllBookings = async () => {
    return await fetchWithFallback(
        async () => {
            const res = await api.get('/bookings');
            return res.data;
        },
        '/bookings'
    ).catch(() => []);
};

export const getCustomerBookings = async (phone) => {
    if (!phone) return [];
    return await fetchWithFallback(
        async () => {
            const res = await api.get(`/bookings/customer/${phone}`);
            return res.data;
        },
        `/bookings/customer/${phone}`
    ).catch(() => []);
};

export const getAvailableSlots = async (date, stylistId = null) => {
    const query = stylistId ? `?date=${date}&stylistId=${stylistId}` : `?date=${date}`;
    return await fetchWithFallback(
        async () => {
            const res = await api.get(`/bookings/available-slots${query}`);
            return res.data;
        },
        `/bookings/available-slots${query}`
    ).catch(() => [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
        "05:00 PM", "06:00 PM", "07:00 PM"
    ]);
};

export const createBooking = async (bookingData) => {
    return await fetchWithFallback(
        async () => {
            const res = await api.post('/bookings', bookingData);
            return res.data;
        },
        '/bookings',
        'POST',
        bookingData
    );
};

export const updateBookingStatus = async (bookingId, status) => {
    return await fetchWithFallback(
        async () => {
            const res = await api.put(`/bookings/${bookingId}/status?status=${status}`);
            return res.data;
        },
        `/bookings/${bookingId}/status?status=${status}`,
        'PUT'
    );
};

export const cancelBooking = async (bookingId) => {
    return await fetchWithFallback(
        async () => {
            const res = await api.delete(`/bookings/${bookingId}`);
            return res.data;
        },
        `/bookings/${bookingId}`,
        'DELETE'
    );
};

export default api;
