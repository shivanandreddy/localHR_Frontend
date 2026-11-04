// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL:   import.meta.env.VITE_API_BASE_URL, // Update with your backend URL if hosted
});

// Helper to get or create persistent device ID
export const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('shiftSync_deviceId');
  if (!deviceId) {
    deviceId = 'device-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
    localStorage.setItem('shiftSync_deviceId', deviceId);
  }
  return deviceId;
};

// Request interceptor for Auth Token & Device ID
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const deviceId = getOrCreateDeviceId();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-device-id'] = deviceId;

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;