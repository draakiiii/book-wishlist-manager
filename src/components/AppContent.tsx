import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Heart, 
  Clock, 
  Trophy, 
  Settings,
  Search,
  BarChart3,
  Database,
  History,
  CheckCircle,
  XCircle,
  User,
  ChevronDown,
  Camera,
  X
} from 'lucide-react';
import CollapsibleConfig from './CollapsibleConfig';
import CollapsibleSection from './CollapsibleSection';
import Sidebar from './Sidebar';
import ProgressBar from './ProgressBar';
import WishlistForm from './WishlistForm';
import TBRForm from './TBRForm';
import BookList from './BookList';
import SagaList from './SagaList';
import SagaCompletionNotification from './SagaCompletionNotification';
import AdvancedSearch from './AdvancedSearch';
import AdvancedStatistics from './AdvancedStatistics';
import DataExportImport from './DataExportImport';
import ScanHistory from './ScanHistory';
import ConfigForm from './ConfigForm';
import BulkScanModal from './BulkScanModal';
import UserProfile from './auth/UserProfile';

import { useAppState } from '../context/FirebaseAppStateContext';
import { useAuth } from '../context/AuthContext';

const AppContent: React.FC = () => {
  const { state, dispatch, loading, syncStatus } = useAppState();
  const { currentUser } = useAuth();
  const [configSidebarOpen, setConfigSidebarOpen] = React.useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [exportImportModalOpen, setExportImportModalOpen] = useState(false);
  const [scanHistoryModalOpen, setScanHistoryModalOpen] = useState(false);
  const [bulkScanModalOpen, setBulkScanModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
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



  // Show loading screen while data is being loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tu biblioteca...</p>
        </div>
      </div>
    );
  }

  // Filtrar libros por estado
  const librosTBR = state.libros.filter(libro => libro.estado === 'tbr');
  const librosLeyendo = state.libros.filter(libro => libro.estado === 'leyendo');
  const librosLeidos = state.libros.filter(libro => libro.estado === 'leido');
  const librosAbandonados = state.libros.filter(libro => libro.estado === 'abandonado');
  const librosWishlist = state.libros.filter(libro => libro.estado === 'wishlist');



  return (
    <div className="theme-transition min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Notificaciones de saga completada */}
      {state.sagaNotifications && state.sagaNotifications.map((notification) => (
        <SagaCompletionNotification
          key={notification.id}
          sagaName={notification.sagaName}
          onClose={() => handleRemoveNotification(notification.id)}
        />
      ))}
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass-effect border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side - Logo and title */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex-shrink-0">
                <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-base sm:text-lg lg:text-xl font-display font-bold gradient-text truncate">
                Mi Biblioteca
              </h1>
              {/* Sync status indicator - hidden on very small screens */}
              <div className="hidden sm:flex ml-2 lg:ml-4 items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'idle' ? 'bg-green-500' : 
                  syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                }`}></div>
                <span className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                  {syncStatus === 'idle' ? 'Sincronizado' : 
                   syncStatus === 'syncing' ? 'Sincronizando...' : 
                   'Error de sincronización'}
                </span>
              </div>
            </div>
            
            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Always visible buttons: Search, Statistics, Settings */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchModalOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Búsqueda Avanzada"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatisticsModalOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Estadísticas Avanzadas"
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
              
              {/* Settings button */}
              <button
                onClick={() => setConfigSidebarOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 lg:hidden"
                title="Configuración"
                data-mobile-config="true"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              {/* Desktop Settings button - opens modal */}
              <button
                onClick={() => setConfigModalOpen(true)}
                className="hidden lg:flex p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Configuración"
                data-desktop-config="true"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
              </button>

              {/* User menu */}
              <div className="relative ml-1 sm:ml-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserProfileOpen(!userProfileOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/20 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="hidden md:block text-sm font-medium truncate max-w-24 lg:max-w-32">
                    {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario'}
                  </span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                </motion.button>
                
                {userProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 z-50">
                    <UserProfile />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
        <div className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
            
            {/* Configuration Section - Desktop Collapsible */}
            <div className="hidden lg:block">
              <CollapsibleConfig />
            </div>

            {/* Progress Section */}
            <CollapsibleSection
              title="Objetivos de Lectura"
              icon={<Trophy className="h-5 w-5" />}
              iconBgColor="bg-success-100 dark:bg-success-900/30"
              iconColor="text-success-600 dark:text-success-400"
            >
              <ProgressBar />
            </CollapsibleSection>

            {/* Wishlist Section */}
            <CollapsibleSection
              title="Lista de Deseos"
              icon={<Heart className="h-5 w-5" />}
              iconBgColor="bg-secondary-100 dark:bg-secondary-900/30"
              iconColor="text-secondary-600 dark:text-secondary-400"
            >
              <WishlistForm />
              <div className="mt-4 sm:mt-6">
                <BookList 
                  books={librosWishlist}
                  type="wishlist"
                  emptyMessage="Tu lista de deseos está vacía."
                />
              </div>
            </CollapsibleSection>

            {/* TBR Section */}
            <CollapsibleSection
              title="Pila de Lectura (TBR)"
              icon={<Clock className="h-5 w-5" />}
              iconBgColor="bg-warning-100 dark:bg-warning-900/30"
              iconColor="text-warning-600 dark:text-warning-400"
            >
              <TBRForm />
              <div className="mt-4 sm:mt-6">
                <BookList 
                  books={librosTBR}
                  type="tbr"
                  emptyMessage="Tu pila está vacía."
                />
              </div>
            </CollapsibleSection>

            {/* Currently Reading Section */}
            <CollapsibleSection
              title="Leyendo Actualmente"
              icon={<BookOpen className="h-5 w-5" />}
              iconBgColor="bg-primary-100 dark:bg-primary-900/30"
              iconColor="text-primary-600 dark:text-primary-400"
            >
              <BookList 
                books={librosLeyendo}
                type="leyendo"
                emptyMessage="No estás leyendo ningún libro actualmente."
              />
            </CollapsibleSection>

            {/* Completed Books Section */}
            <CollapsibleSection
              title="Libros Leídos"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBgColor="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600 dark:text-green-400"
            >
              <BookList 
                books={librosLeidos}
                type="leido"
                emptyMessage="Aún no has terminado ningún libro."
              />
            </CollapsibleSection>

            {/* Abandoned Books Section */}
            <CollapsibleSection
              title="Libros Abandonados"
              icon={<XCircle className="h-5 w-5" />}
              iconBgColor="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-600 dark:text-red-400"
            >
              <BookList 
                books={librosAbandonados}
                type="abandonado"
                emptyMessage="No has abandonado ningún libro."
              />
            </CollapsibleSection>

            {/* Sagas Section */}
            <CollapsibleSection
              title="Mis Sagas"
              icon={<Trophy className="h-5 w-5" />}
              iconBgColor="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600 dark:text-purple-400"
            >
              <SagaList />
            </CollapsibleSection>
        </div>
      </main>
      
      {/* Mobile Configuration Sidebar */}
      <Sidebar 
        isOpen={configSidebarOpen} 
        onClose={() => setConfigSidebarOpen(false)} 
      />

      {/* Desktop Configuration Modal */}
      {configModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
          onClick={() => setConfigModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                  Configuración
                </h3>
              </div>
              <button
                onClick={() => setConfigModalOpen(false)}
                className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
              <ConfigForm />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Advanced Search Modal */}
      <AdvancedSearch
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSearch={setSearchResults}
      />

      {/* Advanced Statistics Modal */}
      <AdvancedStatistics
        isOpen={statisticsModalOpen}
        onClose={() => setStatisticsModalOpen(false)}
      />

      {/* Data Export/Import Modal */}
      <DataExportImport
        isOpen={exportImportModalOpen}
        onClose={() => setExportImportModalOpen(false)}
      />

      {/* Scan History Modal */}
      <ScanHistory
        isOpen={scanHistoryModalOpen}
        onClose={() => setScanHistoryModalOpen(false)}
      />

      {/* Bulk Scan Modal */}
      <BulkScanModal
        isOpen={bulkScanModalOpen}
        onClose={() => setBulkScanModalOpen(false)}
        onBooksAdded={(books) => {
          // Los libros se agregarán automáticamente a través del contexto
          setBulkScanModalOpen(false);
        }}
      />
    </div>
  );
};

export default AppContent;