import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true, // Crucial for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional response interceptor to handle token refreshes in the future
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If accessToken expired (401 status) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to call refresh token endpoint
        await axios.post('http://localhost:5001/api/auth/refresh-token', {}, { withCredentials: true });
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('Session expired. Redirecting to login.');
        // Optional: clear auth state/redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;
