import axios from 'axios';

const AUTH_API_URL = 'http://localhost:8080/api/v1/auth';
const USER_API_URL = 'http://localhost:8080/api/v1/user';
const PRACTICE_API_URL = 'http://localhost:8080/api/v1/practice';
const POSE_API_URL = 'http://localhost:8000';

export const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userApi = axios.create({
  baseURL: USER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const practiceApi = axios.create({
  baseURL: PRACTICE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const poseApi = axios.create({
  baseURL: POSE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in requests
const addTokenInterceptor = (instance: any) => {
  instance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );
};

addTokenInterceptor(authApi);
addTokenInterceptor(userApi);
addTokenInterceptor(practiceApi);
addTokenInterceptor(poseApi);
