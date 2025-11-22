import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (credentials: any) => Promise<any>;
  verifyMfa: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  setupMfa: () => Promise<any>;
  enableMfa: (totpCode: string) => Promise<void>;
  disableMfa: (totpCode: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const response = await authApi.post('/login', credentials);
      const data = response.data;
      
      if (data.mfaRequired) {
        return data; // Return data so component can handle MFA
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
      }
      return data;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyMfa = async (data: any) => {
    setLoading(true);
    try {
      const response = await authApi.post('/mfa/verify', data);
      const responseData = response.data;
      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
        setToken(responseData.token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('MFA verification failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setupMfa = async () => {
    setLoading(true);
    try {
      const response = await authApi.post('/mfa/setup');
      return response.data;
    } catch (error) {
      console.error('MFA setup failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enableMfa = async (totpCode: string) => {
    setLoading(true);
    try {
      await authApi.post(`/mfa/enable?totpCode=${totpCode}`);
    } catch (error) {
      console.error('MFA enable failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async (totpCode: string) => {
    setLoading(true);
    try {
      await authApi.post(`/mfa/disable?totpCode=${totpCode}`);
    } catch (error) {
      console.error('MFA disable failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      await authApi.post('/register', data);
      // Usually redirect to login or auto-login
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, verifyMfa, register, setupMfa, enableMfa, disableMfa, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
