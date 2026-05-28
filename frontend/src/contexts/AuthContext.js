import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Use relative API paths in Docker (proxy handles routing)
// In local dev, the dev server proxy forwards to the backend
const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/user/profile');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', {
        username,
        password
      });
      
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Sign-in failed' 
      };
    }
  };

  const register = async (username, email, phone, password) => {
    try {
      // Get referral link code from localStorage if it exists
      const referralLinkCode = localStorage.getItem('referralLinkCode');
      
      const requestData = {
        username,
        email,
        phone,
        password
      };
      
      // Include referral link code if available
      if (referralLinkCode) {
        requestData.referralLinkCode = referralLinkCode;
      }
      
      const response = await api.post('/register', requestData);
      
      // Clear the referral link code from localStorage after successful registration
      if (referralLinkCode) {
        localStorage.removeItem('referralLinkCode');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout', {});
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { api };