import api from './api';
import { LoginData, RegisterData, AuthResponse, User } from '../types/auth';
import { getCsrfCookie } from '../services/api'; // If you put it in the same file, you don't need this import

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    await getCsrfCookie();
    const response = await api.post<AuthResponse>('/login', data);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await getCsrfCookie();
    const response = await api.post<AuthResponse>('/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async getUser(): Promise<User> {
    const response = await api.get<User>('/user');
    return response.data;
  },

  async getDashboardData(): Promise<any> {
    const response = await api.get('/dashboard');
    return response.data;
  }
};