import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthWrapper from './AuthWrapper';
import AppContent from '../AppContent';

const AuthenticatedApp: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthWrapper />;
  }

  return <AppContent />;
};

export default AuthenticatedApp;