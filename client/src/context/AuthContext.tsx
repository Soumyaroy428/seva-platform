'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '@/lib/types';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  sendOtp: (identifier: string, intent: 'login' | 'register', registerData?: any) => Promise<{ success: boolean; message?: string; otpPreview?: string; error?: string }>;
  verifyOtp: (identifier: string, code: string, registerData?: any) => Promise<{ success: boolean; user?: IUser; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: IUser }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'donor' | 'volunteer' | 'admin';
    phone?: string;
    area?: string;
    skills?: string[];
    availability?: string;
  }) => Promise<{ success: boolean; error?: string; message?: string; user?: IUser }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user from localStorage on mount and re-verify live status
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem('seva_user');
        if (stored) {
          const parsedUser: IUser = JSON.parse(stored);
          setUser(parsedUser);

          // Fetch fresh status from backend (especially volunteer approval status)
          if (parsedUser.email) {
            try {
              const res = await fetch(`/api/auth/me?email=${encodeURIComponent(parsedUser.email)}`);
              const data = await res.json();
              if (data.success && data.user) {
                setUser(data.user);
                localStorage.setItem('seva_user', JSON.stringify(data.user));
              }
            } catch (err) {
              console.warn('Silent refresh error:', err);
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse cached auth:', e);
        localStorage.removeItem('seva_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const sendOtp = async (identifier: string, intent: 'login' | 'register', registerData?: any) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, intent, registerData })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to send verification code.' };
      }
      return {
        success: true,
        message: data.message,
        otpPreview: data.otpPreview
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error sending OTP.' };
    }
  };

  const verifyOtp = async (identifier: string, code: string, registerData?: any) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code, registerData })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Verification failed.' };
      }

      setUser(data.user);
      localStorage.setItem('seva_user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('seva_token', data.token);
      }
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during verification.' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      localStorage.setItem('seva_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred.' };
    }
  };

  const register = async (regData: {
    name: string;
    email: string;
    password: string;
    role: 'donor' | 'volunteer' | 'admin';
    phone?: string;
    area?: string;
    skills?: string[];
    availability?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      localStorage.setItem('seva_user', JSON.stringify(data.user));
      return { success: true, message: data.message, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('seva_user');
    localStorage.removeItem('seva_token');
  };

  const refreshUser = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('seva_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Error refreshing user status:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendOtp, verifyOtp, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
