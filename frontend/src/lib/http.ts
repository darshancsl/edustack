import axios from 'axios';

const baseURL = (process.env.API_URL as string) || 'https://edustack-vyc5.onrender.com';

export const http = axios.create({
  baseURL,
  // If you later switch to httpOnly cookies, set withCredentials: true
  withCredentials: false,
});

// Attach token from storage (dev-friendly; prefer httpOnly cookies in prod)
http.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
