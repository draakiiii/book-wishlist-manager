import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import AuthService from '../services/authService';
import DatabaseService from '../services/databaseService';
import { AppState } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  migrateData: (localStorageData: AppState) => Promise<void>;
  hasMigratedData: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMigratedData, setHasMigratedData] = useState(false);

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      console.log('AuthContext: Auth state changed', { user: user?.email });
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await AuthService.login(email, password);
      await DatabaseService.updateLastLogin();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await AuthService.loginWithGoogle();
      await DatabaseService.updateLastLogin();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await AuthService.register(email, password);
      await DatabaseService.createUserProfile(email);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setHasMigratedData(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const migrateData = async (localStorageData: AppState) => {
    try {
      await DatabaseService.migrateFromLocalStorage(localStorageData);
      setHasMigratedData(true);
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    migrateData,
    hasMigratedData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};