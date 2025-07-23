import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  LogOut, 
  Settings, 
  Shield, 
  Cloud, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Database,
  Wifi,
  WifiOff,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/FirebaseAppStateContext';

const UserProfile: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const { state, syncStatus, lastSync } = useAppState();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'idle':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'idle':
        return 'Sincronizado';
      case 'syncing':
        return 'Sincronizando...';
      case 'error':
        return 'Error de sincronización';
      default:
        return 'Sin conexión';
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'idle':
        return 'text-green-600 dark:text-green-400';
      case 'syncing':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-72 sm:w-80"
    >
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {currentUser?.displayName || 'Usuario'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
            {currentUser?.email}
          </p>
        </div>
      </div>

      {/* Account Info */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
          <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-300 truncate">
            {currentUser?.email}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-300">
            Miembro desde {formatDate(currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime) : null)}
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
          <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-300">
            {currentUser?.emailVerified ? 'Email verificado' : 'Email no verificado'}
          </span>
        </div>
      </div>

      {/* Sync Status */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mb-4 sm:mb-6">
        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center">
          <Cloud className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Estado de Sincronización
        </h4>
        
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Estado:</span>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {getSyncStatusIcon()}
              <span className={`text-xs sm:text-sm font-medium ${getSyncStatusColor()}`}>
                {getSyncStatusText()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Última sincronización:</span>
            <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
              {formatDate(lastSync)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Libros sincronizados:</span>
            <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
              {state.libros.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sagas sincronizadas:</span>
            <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
              {state.sagas.length}
            </span>
          </div>
        </div>
      </div>

      {/* Library Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mb-4 sm:mb-6">
        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center">
          <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Estadísticas de Biblioteca
        </h4>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Libros leídos:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {state.libros.filter(b => b.estado === 'leido').length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">En TBR:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {state.libros.filter(b => b.estado === 'tbr').length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Leyendo:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {state.libros.filter(b => b.estado === 'leyendo').length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Wishlist:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {state.libros.filter(b => b.estado === 'wishlist').length}
            </span>
          </div>
        </div>
      </div>

      {/* Points System */}
      {state.config.sistemaPuntosHabilitado && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mb-4 sm:mb-6">
          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
            Sistema de Puntos
          </h4>
          
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Puntos actuales:</span>
              <span className="font-bold text-yellow-600 dark:text-yellow-400">
                {state.puntosActuales}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Puntos ganados:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {state.puntosGanados}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Libros comprados:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {state.librosCompradosConPuntos}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigningOut ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
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
    </motion.div>
  );
};

export default UserProfile;