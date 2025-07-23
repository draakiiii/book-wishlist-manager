import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  signInUser, 
  signUpUser, 
  signOutUser, 
  resetPassword, 
  onAuthStateChange,
  signInWithGoogle,
  getGoogleRedirectResult
} from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Check for Google redirect result
    const checkGoogleRedirect = async () => {
      try {
        await getGoogleRedirectResult();
      } catch (error) {
        console.error('Error checking Google redirect:', error);
      }
    };

    checkGoogleRedirect();

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInUser(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      await signUpUser(email, password, displayName);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle: signInWithGoogleAuth,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};