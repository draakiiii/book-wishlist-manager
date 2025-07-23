import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Heart, 
  Clock, 
  Trophy, 
  Search,
  BarChart3,
  Database,
  History,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Users,
  Share2,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Camera,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import CollapsibleSection from './CollapsibleSection';
import ProgressBar from './ProgressBar';
import BookList from './BookList';
import SagaList from './SagaList';
import UserProfile from './auth/UserProfile';

import { useAppState } from '../context/FirebaseAppStateContext';
import { useAuth } from '../context/AuthContext';

const AppContent: React.FC = () => {
  const { state, dispatch, loading, syncStatus } = useAppState();
  const { currentUser, signOut } = useAuth();
  const [userProfileOpen, setUserProfileOpen] = useState(false);


  useEffect(() => {
    // Aplicar el modo oscuro al body
    document.body.classList.toggle('dark', state.darkMode);
    
    // Aplicar el modo oscuro al html también para mejor compatibilidad
    document.documentElement.classList.toggle('dark', state.darkMode);
    
    // Actualizar el meta theme-color para móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', state.darkMode ? '#1e293b' : '#ffffff');
    }
  }, [state.darkMode]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Solo cambiar si el usuario no ha establecido una preferencia manual
      const savedPreference = localStorage.getItem('bibliotecaLibrosDarkMode');
      if (savedPreference === null) {
        dispatch({ type: 'SET_DARK_MODE', payload: e.matches });
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [dispatch]);

  const handleRemoveNotification = (id: number) => {
    dispatch({ type: 'REMOVE_SAGA_NOTIFICATION', payload: { id } });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading screen while data is being loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tu biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with menu and user info */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Guardian Compras
              </h1>
              {/* Sync status indicator */}
              <div className="ml-4 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'idle' ? 'bg-green-500' : 
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {syncStatus === 'idle' ? 'Sincronizado' : 
                   syncStatus === 'syncing' ? 'Sincronizando...' : 
                   'Error de sincronización'}
                </span>
              </div>
            </div>
            
            {/* Menu buttons */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Búsqueda avanzada - Funcionalidad en desarrollo')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Búsqueda avanzada"
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Statistics */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Estadísticas avanzadas - Funcionalidad en desarrollo')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Estadísticas avanzadas"
              >
                <BarChart3 className="h-5 w-5" />
              </motion.button>

              {/* Export/Import */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Exportar/Importar datos - Funcionalidad en desarrollo')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Exportar/Importar datos"
              >
                <Database className="h-5 w-5" />
              </motion.button>

              {/* Scan History */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Historial de escaneos - Funcionalidad en desarrollo')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Historial de escaneos"
              >
                <History className="h-5 w-5" />
              </motion.button>

              {/* Bulk Scan */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Escaneo masivo - Funcionalidad en desarrollo')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Escaneo masivo"
              >
                <Camera className="h-5 w-5" />
              </motion.button>

              {/* Configuration */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert('Configuración - Funcionalidad en desarrollo')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Configuración"
              >
                <Settings className="h-5 w-5" />
              </motion.button>

              {/* User menu */}
              <div className="relative ml-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserProfileOpen(!userProfileOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
                
                {userProfileOpen && (
                  <div className="absolute right-0 mt-2 w-80 z-50">
                    <UserProfile />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {state.sagaNotifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {state.sagaNotifications.map((notification) => (
              <div key={notification.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-green-800 dark:text-green-200">
                      ¡Saga completada: {notification.sagaName}!
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveNotification(notification.id)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress Section */}
        <CollapsibleSection
          title="Progreso de Lectura"
          icon={<Trophy className="h-5 w-5" />}
          iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
          iconColor="text-yellow-600 dark:text-yellow-400"
        >
          <ProgressBar />
        </CollapsibleSection>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Currently Reading */}
            <CollapsibleSection
              title="Leyendo Actualmente"
              icon={<BookOpen className="h-5 w-5" />}
              iconBgColor="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'leyendo')}
                type="leyendo"
                emptyMessage="No estás leyendo ningún libro actualmente"
              />
            </CollapsibleSection>

            {/* To Be Read */}
            <CollapsibleSection
              title="Por Leer (TBR)"
              icon={<Clock className="h-5 w-5" />}
              iconBgColor="bg-orange-100 dark:bg-orange-900/30"
              iconColor="text-orange-600 dark:text-orange-400"
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'tbr')}
                type="tbr"
                emptyMessage="Tu lista de lectura está vacía"
              />
            </CollapsibleSection>

            {/* Completed Books */}
            <CollapsibleSection
              title="Libros Leídos"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'leido')}
                type="leido"
                emptyMessage="Aún no has leído ningún libro"
              />
            </CollapsibleSection>

            {/* Abandoned Books */}
            <CollapsibleSection
              title="Libros Abandonados"
              icon={<XCircle className="h-5 w-5" />}
              iconBgColor="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-600 dark:text-red-400"
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'abandonado')}
                type="abandonado"
                emptyMessage="No has abandonado ningún libro"
              />
            </CollapsibleSection>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Wishlist */}
            <CollapsibleSection
              title="Wishlist"
              icon={<Heart className="h-5 w-5" />}
              iconBgColor="bg-pink-100 dark:bg-pink-900/30"
              iconColor="text-pink-600 dark:text-pink-400"
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'wishlist')}
                type="wishlist"
                emptyMessage="Tu wishlist está vacía"
              />
            </CollapsibleSection>

            {/* Sagas */}
            <CollapsibleSection
              title="Sagas"
              icon={<Users className="h-5 w-5" />}
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
            >
              <SagaList />
            </CollapsibleSection>

            {/* Purchased Books */}
            <CollapsibleSection
              title="Libros Comprados"
              icon={<ShoppingCart className="h-5 w-5" />}
              iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
              iconColor="text-emerald-600 dark:text-emerald-400"
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'comprado')}
                type="comprado"
                emptyMessage="No has comprado ningún libro"
              />
            </CollapsibleSection>

            {/* Lent Books */}
            <CollapsibleSection
              title="Libros Prestados"
              icon={<Share2 className="h-5 w-5" />}
              iconBgColor="bg-cyan-100 dark:bg-cyan-900/30"
              iconColor="text-cyan-600 dark:text-cyan-400"
            >
              <BookList
                books={state.libros.filter(book => book.estado === 'prestado')}
                type="prestado"
                emptyMessage="No tienes libros prestados"
              />
            </CollapsibleSection>
          </div>
        </div>
      </main>

      {/* Modals - Placeholder for future implementation */}
    </div>
  );
};

export default AppContent;