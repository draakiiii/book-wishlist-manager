import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/FirebaseAppStateContext';
import { LogOut, User, Settings, Cloud, CloudOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const { syncStatus, lastSync } = useAppState();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'idle':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <CloudOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Sincronizando...';
      case 'error':
        return 'Error de sincronización';
      case 'idle':
        return 'Sincronizado';
      default:
        return 'Sin conexión';
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {currentUser?.displayName || 'Usuario'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {currentUser?.email}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <Cloud className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Estado de sincronización</span>
          </div>
          <div className="flex items-center space-x-2">
            {getSyncStatusIcon()}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getSyncStatusText()}
            </span>
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Última sincronización</span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatLastSync(lastSync)}
          </span>
        </div>

        {/* Account Info */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">ID de usuario</span>
              <span className="text-sm text-gray-900 dark:text-white font-mono">
                {currentUser?.uid?.substring(0, 8)}...
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Email verificado</span>
              <span className={`text-sm ${currentUser?.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                {currentUser?.emailVerified ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cuenta creada</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {currentUser?.metadata.creationTime ? 
                  new Date(currentUser.metadata.creationTime).toLocaleDateString('es-ES') : 
                  'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Cerrando sesión...</span>
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;