import React, { useEffect, useState, useCallback } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
  Book,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Users,
  X,
  Share2
} from 'lucide-react';
import CollapsibleConfig from './components/CollapsibleConfig';
import CollapsibleSection from './components/CollapsibleSection';
import Sidebar from './components/Sidebar';
import ProgressBar from './components/ProgressBar';
import WishlistForm from './components/WishlistForm';
import TBRForm from './components/TBRForm';
import BookList from './components/BookList';
import SagaList from './components/SagaList';
import SagaCompletionNotification from './components/SagaCompletionNotification';
import AdvancedSearch from './components/AdvancedSearch';
import AdvancedStatistics from './components/AdvancedStatistics';
import DataExportImport from './components/DataExportImport';
import ScanHistory from './components/ScanHistory';
import ConfigForm from './components/ConfigForm';
import BulkScanModal from './components/BulkScanModal';
import AdvancedConfigForm from './components/AdvancedConfigForm';

import LoginScreen from './components/LoginScreen';

import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { user, loading: authLoading, isAuthenticated, logout, migrateData, hasMigratedData } = useAuth();
  const [configSidebarOpen, setConfigSidebarOpen] = React.useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [advancedConfigModalOpen, setAdvancedConfigModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [exportImportModalOpen, setExportImportModalOpen] = useState(false);
  const [scanHistoryModalOpen, setScanHistoryModalOpen] = useState(false);
  const [bulkScanModalOpen, setBulkScanModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);


  console.log('AppContent rendered', { authLoading, isAuthenticated, user: user?.email });

  // Inicializar searchResults con todos los libros cuando se abre el modal
  useEffect(() => {
    if (searchModalOpen) {
      setSearchResults(state.libros);
    }
  }, [searchModalOpen, state.libros]);

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

  // Migrar datos desde localStorage cuando el usuario se autentica por primera vez
  useEffect(() => {
    if (isAuthenticated && user && !hasMigratedData) {
      const localStorageData = localStorage.getItem('bibliotecaLibrosState_v1_0');
      if (localStorageData) {
        try {
          const parsedData = JSON.parse(localStorageData);
          migrateData(parsedData);
        } catch (error) {
          console.error('Error migrating data:', error);
        }
      }
    }
  }, [isAuthenticated, user, hasMigratedData, migrateData]);

  const handleLoginSuccess = () => {
    // El usuario ya está autenticado, no necesitamos hacer nada más
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutConfirmOpen(false);
    await handleLogout();
  };

  const handleRemoveNotification = (id: number) => {
    dispatch({ type: 'REMOVE_SAGA_NOTIFICATION', payload: { id } });
  };

  const handleOpenConfig = () => {
    // En móvil, abrir el sidebar de configuración
    // En desktop, abrir el modal de configuración
    if (window.innerWidth < 768) {
      setConfigSidebarOpen(true);
    } else {
      setConfigModalOpen(true);
    }
  };



  // Filtrar libros por estado
  const librosTBR = state.libros.filter(libro => libro.estado === 'tbr');
  const librosLeyendo = state.libros.filter(libro => libro.estado === 'leyendo');
  const librosLeidos = state.libros.filter(libro => libro.estado === 'leido');
  const librosAbandonados = state.libros.filter(libro => libro.estado === 'abandonado');
  const librosWishlist = state.libros.filter(libro => libro.estado === 'wishlist');

  // Libros prestados (para mostrar en resumen, pero no como sección separada)
  const librosPrestados = state.libros.filter(libro => libro.prestado === true);

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Mostrar pantalla de login si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8"
          >
            {/* Logo y título */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Mi Biblioteca
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Inicia sesión para acceder a tu biblioteca personal
              </p>
            </div>

            {/* Login Screen integrado */}
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        </div>
      </div>
    );
  }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-display font-bold gradient-text">
                  Mi Biblioteca
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search and Statistics buttons - visible on all screens */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchModalOpen(true)}
                className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Búsqueda Avanzada"
              >
                <Search className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatisticsModalOpen(true)}
                className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 mx-1"
                title="Estadísticas Avanzadas"
              >
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
              
              {/* Botón de Exportar/Importar Datos - DESHABILITADO TEMPORALMENTE */}
              {/* Para habilitar, descomenta las siguientes líneas: */}
              {/*
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExportImportModalOpen(true)}
                className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Exportar/Importar Datos"
              >
                <Database className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
              */}
              
              {/* Historial de Escaneos - DESHABILITADO TEMPORALMENTE */}
              {/*
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setScanHistoryModalOpen(true)}
                className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Historial de Escaneos"
              >
                <History className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
              */}
              
              {/* Settings button */}
              <button
                onClick={() => setConfigSidebarOpen(true)}
                className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 lg:hidden"
                title="Configuración"
                data-mobile-config="true"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              {/* Desktop Settings button - opens modal */}
              <button
                onClick={() => setConfigModalOpen(true)}
                className="hidden lg:flex p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Configuración"
                data-desktop-config="true"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
              </button>

              {/* Advanced Configuration button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAdvancedConfigModalOpen(true)}
                className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Configuración Avanzada"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
              </motion.button>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogoutClick}
                className="p-1.5 md:p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors duration-200"
                title={`Cerrar sesión (${user?.email})`}
              >
                <Users className="h-4 w-4 md:h-5 md:w-5 text-red-600 dark:text-red-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            
            {/* Configuration Section - Desktop Collapsible */}
            <div className="hidden lg:block">
              <CollapsibleConfig />
            </div>

            {/* Progress Section */}
            {state.config.mostrarSeccionProgreso !== false && (
              <CollapsibleSection
                title="Progreso y Puntos/Dinero"
                icon={<Trophy className="h-5 w-5" />}
                iconBgColor="bg-success-100 dark:bg-success-900/30"
                iconColor="text-success-600 dark:text-success-400"
              >
                <ProgressBar />
              </CollapsibleSection>
            )}

            {/* Wishlist Section */}
            {state.config.mostrarSeccionWishlist !== false && (
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
            )}

            {/* TBR Section */}
            {state.config.mostrarSeccionTBR !== false && (
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
            )}

            {/* Currently Reading Section */}
            {state.config.mostrarSeccionLeyendo !== false && (
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
            )}

            {/* Completed Books Section */}
            {state.config.mostrarSeccionLeidos !== false && (
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
            )}

            {/* Abandoned Books Section */}
            {state.config.mostrarSeccionAbandonados !== false && (
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
            )}



            {/* Sagas Section */}
            {state.config.mostrarSeccionSagas !== false && (
              <CollapsibleSection
                title="Mis Sagas"
                icon={<Trophy className="h-5 w-5" />}
                iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                iconColor="text-purple-600 dark:text-purple-400"
              >
                <SagaList />
              </CollapsibleSection>
            )}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfigModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Configuración
                </h3>
              </div>
              <button
                onClick={() => setConfigModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <ConfigForm />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Advanced Configuration Modal */}
      {advancedConfigModalOpen && (
        <AdvancedConfigForm onClose={() => setAdvancedConfigModalOpen(false)} />
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

      {/* Logout Confirmation Dialog */}
      {logoutConfirmOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setLogoutConfirmOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Cerrar Sesión
                </h3>
              </div>
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                ¿Estás seguro de que deseas cerrar la sesión?
              </p>
              
              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setLogoutConfirmOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}


    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </AuthProvider>
  );
};

export default App; 