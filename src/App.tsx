import React, { useEffect, useState } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Settings,
  Users,
  X,
  Clock,
  Heart,
  Trophy
} from 'lucide-react';
import Navigation, { NavigationSection, BooksViewMode } from './components/Navigation';
import BooksView from './components/BooksView';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import Sidebar from './components/Sidebar';
import SagaCompletionNotification from './components/SagaCompletionNotification';
import DataExportImport from './components/DataExportImport';
import ScanHistory from './components/ScanHistory';
import ConfigForm from './components/ConfigForm';
import BulkScanModal from './components/BulkScanModal';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import TBRForm from './components/TBRForm';
import WishlistForm from './components/WishlistForm';
import SagaList from './components/SagaList';

import LoginScreen from './components/LoginScreen';

import './App.css';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { user, loading: authLoading, isAuthenticated, logout, migrateData, hasMigratedData } = useAuth();
  const [configSidebarOpen, setConfigSidebarOpen] = React.useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Estados para todos los modales
  const [exportImportModalOpen, setExportImportModalOpen] = useState(false);
  const [scanHistoryModalOpen, setScanHistoryModalOpen] = useState(false);
  const [bulkScanModalOpen, setBulkScanModalOpen] = useState(false);
  const [barcodeScannerModalOpen, setBarcodeScannerModalOpen] = useState(false);
  const [tbrFormModalOpen, setTbrFormModalOpen] = useState(false);
  const [wishlistFormModalOpen, setWishlistFormModalOpen] = useState(false);
  const [sagaListModalOpen, setSagaListModalOpen] = useState(false);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  
  // Estados para navegación
  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');
  const [currentBooksView, setCurrentBooksView] = useState<BooksViewMode>('list');

  console.log('AppContent rendered', { authLoading, isAuthenticated, user: user?.email });

  // Función para manejar la apertura de modales desde la navegación
  const handleModalOpen = (modal: string) => {
    switch (modal) {
      case 'barcodeScanner':
        setBarcodeScannerModalOpen(true);
        break;
      case 'bulkScan':
        setBulkScanModalOpen(true);
        break;
      case 'scanHistory':
        setScanHistoryModalOpen(true);
        break;
      case 'dataExportImport':
        setExportImportModalOpen(true);
        break;
      case 'tbrForm':
        setTbrFormModalOpen(true);
        break;
      case 'wishlistForm':
        setWishlistFormModalOpen(true);
        break;
      case 'sagaList':
        setSagaListModalOpen(true);
        break;
      case 'configForm':
        setConfigModalOpen(true);
        break;
      default:
        break;
    }
  };

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
      console.error('Error during logout:', error);
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

  // Mostrar pantalla de login si no está autenticado
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
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
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary-500" />
                <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
                  Biblioteca
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <Navigation
                  currentSection={currentSection}
                  currentBooksView={currentBooksView}
                  onSectionChange={setCurrentSection}
                  onBooksViewChange={setCurrentBooksView}
                  onModalOpen={handleModalOpen}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              
              {/* Mobile Navigation */}
              <div className="md:hidden">
                <Navigation
                  currentSection={currentSection}
                  currentBooksView={currentBooksView}
                  onSectionChange={setCurrentSection}
                  onBooksViewChange={setCurrentBooksView}
                  onModalOpen={handleModalOpen}
                />
              </div>

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
        {currentSection === 'dashboard' ? (
          <Dashboard />
        ) : currentSection === 'books' ? (
          // Books view content
          <BooksView 
            viewMode={currentBooksView}
            onViewModeChange={setCurrentBooksView}
          />
        ) : currentSection === 'statistics' ? (
          // Statistics view content
          <Statistics />
        ) : null}
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

      {/* Barcode Scanner Modal */}
      {barcodeScannerModalOpen && (
        <BarcodeScannerModal
          onClose={() => setBarcodeScannerModalOpen(false)}
          onScanSuccess={(isbn) => {
            // El libro se agregará automáticamente a través del contexto
            setBarcodeScannerModalOpen(false);
          }}
        />
      )}

      {/* TBR Form Modal */}
      {tbrFormModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setTbrFormModalOpen(false)}
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
                <Clock className="h-5 w-5 text-warning-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Agregar a TBR
                </h3>
              </div>
              <button
                onClick={() => setTbrFormModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <TBRForm />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Wishlist Form Modal */}
      {wishlistFormModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setWishlistFormModalOpen(false)}
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
                <Heart className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Agregar a Wishlist
                </h3>
              </div>
              <button
                onClick={() => setWishlistFormModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <WishlistForm />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Saga List Modal */}
      {sagaListModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSagaListModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Gestión de Sagas
                </h3>
              </div>
              <button
                onClick={() => setSagaListModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <SagaList />
            </div>
          </motion.div>
        </motion.div>
      )}

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