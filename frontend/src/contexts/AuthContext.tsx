import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let didCancel = false;
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            const userData = await authService.getUser();
            if (!didCancel) {
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
        } catch (error) {
          console.log('Auth initialization error:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          if (!didCancel) setUser(null);
        }
      }
      if (!didCancel) setLoading(false);
    };
    initAuth();
    return () => { didCancel = true; };
  }, []);

  // Only navigate to dashboard if user is authenticated and not already on dashboard
  useEffect(() => {
    if (user && window.location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const response = await authService.login({ email, password });
      console.log('Login successful:', response);
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      console.log('Login failed:', error.response?.data || error.message);
      // Always throw so the form can handle and show the error
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};