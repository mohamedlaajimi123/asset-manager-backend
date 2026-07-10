import api from '../api';
import type { LoginPayload, RegisterPayload, AuthResponse } from './auth.type';

// Route: POST /auth/register -> Creates a brand new account
export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

// Route: POST /auth/login -> Logs an existing user in and saves their token
export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', payload);
  
  // Assuming your NestJS backend sends back an object like { accessToken: '...', user: { role: 'ADMIN', ... } }
  if (response.data && response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('userRole', (response.data.user?.role || 'USER').toUpperCase());
  }
  
  return response.data;
};

// Simple utility helper to clear out storage when logging out
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  window.location.href = '/login'; // Redirects them right back to the login screen
};