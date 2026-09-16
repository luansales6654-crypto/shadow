import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AppNotification } from '../types/index.ts';
import { api, setToken, clearToken } from '../utils/apiClient.ts';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isActive: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string, planId?: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], title?: string) => void;
  removeToast: (id: string) => void;
  notifications: AppNotification[];
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_ADMIN_EMAIL = 'luancamp953@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('vendeai_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success', title?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('vendeai_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {
      clearToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
    } catch {}
  }, [user]);

  useEffect(() => {
    refreshUser();

    const handleExpired = () => {
      setTokenState(null);
      setUser(null);
      addToast('Sua sessão expirou. Faça login novamente.', 'warning', 'Sessão Finalizada');
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [refreshUser, addToast]);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications]);

  const login = async (email: string, pass: string): Promise<User> => {
    const data = await api.login(email, pass);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    addToast(`Bem-vindo, ${data.user.name}!`, 'success');
    return data.user;
  };

  const register = async (name: string, email: string, pass: string, planId?: string): Promise<User> => {
    const data = await api.register(name, email, pass, planId);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    addToast('Conta criada com sucesso!', 'success');
    return data.user;
  };

  const logout = () => {
    api.logout().catch(() => {});
    clearToken();
    setTokenState(null);
    setUser(null);
    addToast('Você saiu da plataforma.', 'info');
  };

  // Strictly check admin: email MUST be luancamp953@gmail.com and role MUST be admin
  const isAdmin = Boolean(
    user && user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase() && user.role === 'admin'
  );

  const isActive = Boolean(user && (user.status === 'active' || isAdmin));
  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isActive,
        login,
        register,
        logout,
        refreshUser,
        toasts,
        addToast,
        removeToast,
        notifications,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
