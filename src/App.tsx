import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Settings,
  Users,
  X,
  Clock,
  Heart,
  Trophy,
  Scan,
  Database,
  History
} from 'lucide-react';
import Navigation, { NavigationSection, BooksViewMode } from './components/Navigation';
import BooksView from './components/BooksView';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
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

import { AppStateProvider, useAppState } from './context/AppStateContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Tipos para las nuevas pantallas
export type ScreenType = 
  | 'dashboard' 
  | 'books' 
  | 'statistics' 
  | 'barcodeScanner'
  | 'bulkScan'
  | 'scanHistory'
  | 'dataExportImport'
  | 'tbrForm'
  | 'wishlistForm'
  | 'sagaList'
  | 'configForm';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [currentBooksView, setCurrentBooksView] = useState<BooksViewMode>('list');
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  
  const { logout } = useAuth();

  // Aplicar tema oscuro/claro
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Función para manejar el cambio de pantalla
  const handleScreenChange = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  // Función para manejar el cambio de vista de libros
  const handleBooksViewChange = (view: BooksViewMode) => {
    setCurrentBooksView(view);
    setCurrentScreen('books');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLogoutConfirmOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  // Función para renderizar la pantalla actual
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'books':
        return <BooksView viewMode={currentBooksView} onViewModeChange={handleBooksViewChange} />;
      case 'statistics':
        return <Statistics />;
      case 'barcodeScanner':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Scan className="h-6 w-6 text-primary-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Escáner de Código de Barras
                    </h1>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <BarcodeScannerModal
                  onClose={() => setCurrentScreen('dashboard')}
                  onScanSuccess={(isbn) => {
                    // El libro se agregará automáticamente a través del contexto
                    setCurrentScreen('dashboard');
                  }}
                />
              </div>
            </div>
          </div>
        );
      case 'bulkScan':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Scan className="h-6 w-6 text-primary-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Escaneo Masivo
                    </h1>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <BulkScanModal
                  isOpen={true}
                  onClose={() => setCurrentScreen('dashboard')}
                  onBooksAdded={(books) => {
                    setCurrentScreen('dashboard');
                  }}
                />
              </div>
            </div>
          </div>
        );
      case 'scanHistory':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <History className="h-6 w-6 text-primary-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Historial de Escaneos
                    </h1>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <ScanHistory
                  isOpen={true}
                  onClose={() => setCurrentScreen('dashboard')}
                />
              </div>
            </div>
          </div>
        );
      case 'dataExportImport':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Database className="h-6 w-6 text-primary-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Exportar/Importar Datos
                    </h1>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <DataExportImport
                  isOpen={true}
                  onClose={() => setCurrentScreen('dashboard')}
                />
              </div>
            </div>
          </div>
        );
      case 'tbrForm':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6 text-warning-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Agregar a TBR
                    </h1>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <TBRForm />
              </div>
            </div>
          </div>
        );
      case 'wishlistForm':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Heart className="h-6 w-6 text-red-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Agregar a Wishlist
                    </h1>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <WishlistForm />
              </div>
            </div>
          </div>
        );
      case 'sagaList':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Gestión de Sagas
                    </h1>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <SagaList />
              </div>
            </div>
          </div>
        );
      case 'configForm':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-6 w-6 text-primary-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Configuración
                    </h1>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <ConfigForm />
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

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
                  currentSection={currentScreen as NavigationSection}
                  currentBooksView={currentBooksView}
                  onSectionChange={handleScreenChange}
                  onBooksViewChange={handleBooksViewChange}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Mobile Navigation */}
              <div className="md:hidden">
                <Navigation
                  currentSection={currentScreen as NavigationSection}
                  currentBooksView={currentBooksView}
                  onSectionChange={handleScreenChange}
                  onBooksViewChange={handleBooksViewChange}
                />
              </div>

              {/* Botón de configuración */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentScreen('configForm')}
                className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Configuración"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
              </motion.button>

              {/* Botón de cerrar sesión */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLogoutConfirmOpen(true)}
                className="p-1.5 md:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                title="Cerrar sesión"
              >
                <Users className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Contenido principal */}
      <main className="flex-1">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentScreen()}
        </motion.div>
      </main>

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
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Cerrar sesión
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                ¿Estás seguro de que quieres cerrar sesión?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setLogoutConfirmOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Cerrar sesión
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