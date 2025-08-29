import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Settings, RotateCcw, Camera, CheckCircle, AlertCircle, Loader2, Target, Bell, Trophy } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';
import Dialog from './Dialog';

const ConfigForm: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { dialog, showSuccess, showError, showConfirm, hideDialog } = useDialog();
  const [config, setConfig] = useState(state.config);

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [isVerifyingCameras, setIsVerifyingCameras] = useState(false);
  const [cameraVerificationStatus, setCameraVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');



  const handleReset = () => {
    showConfirm(
      'Resetear Progreso',
      '¿Estás seguro de que quieres resetear tu progreso? Esto eliminará todos tus datos de lectura, puntos y dinero.',
      () => {
        dispatch({ type: 'IMPORT_DATA', payload: { libros: [], sagas: [] } });
        dispatch({ type: 'RESETEAR_PUNTOS' });
        dispatch({ type: 'RESETEAR_DINERO' });
        showSuccess('Progreso reseteado', 'Todos los datos han sido eliminados correctamente.');
      },
      undefined,
      'Resetear',
      'Cancelar'
    );
  };

  const handleResetPoints = () => {
    showConfirm(
      'Resetear Solo Puntos',
      '¿Estás seguro de que quieres resetear solo tus puntos/dinero? Esto no afectará tus libros ni sagas.',
      () => {
        dispatch({ type: 'RESETEAR_PUNTOS' });
        if (config.modoDinero) {
          dispatch({ type: 'RESETEAR_DINERO' });
        }
        showSuccess('Puntos reseteados', `${config.modoDinero ? 'Dinero' : 'Puntos'} reseteado correctamente.`);
      },
      undefined,
      'Resetear',
      'Cancelar'
    );
  };

  const handleCleanDuplicateSagas = () => {
    showConfirm(
      'Limpiar Sagas Duplicadas',
      '¿Estás seguro de que quieres limpiar las sagas duplicadas? Esto eliminará las sagas vacías y duplicadas.',
      () => {
        dispatch({ type: 'CLEAN_DUPLICATE_SAGAS' });
        showSuccess('Sagas limpiadas', 'Sagas duplicadas limpiadas correctamente.');
      },
      undefined,
      'Limpiar',
      'Cancelar'
    );
  };

  const handleInputChange = (field: keyof typeof config, value: number) => {
    const newConfig = { ...config, [field]: Math.max(0, value) };
    setConfig(newConfig);
    dispatch({ type: 'SET_CONFIG', payload: newConfig });
  };

  const handleBooleanChange = (field: keyof typeof config, value: boolean) => {
    const newConfig = { ...config, [field]: value };
    
    // Si se desactiva el sistema de puntos, también ocultar la sección de progreso
    if (field === 'sistemaPuntosHabilitado' && !value) {
      newConfig.mostrarSeccionProgreso = false;
    }
    
    setConfig(newConfig);
    dispatch({ type: 'SET_CONFIG', payload: newConfig });
  };

  const handleStringChange = (field: keyof typeof config, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    dispatch({ type: 'SET_CONFIG', payload: newConfig });
  };

  // Verify cameras and request permissions
  const handleVerifyCameras = async () => {
    setIsVerifyingCameras(true);
    setCameraVerificationStatus('idle');
    
    try {
      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the stream immediately after getting permissions
      stream.getTracks().forEach(track => track.stop());
      
      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      
      setCameraVerificationStatus('success');
      
      if (videoDevices.length === 0) {
        showError('No hay cámaras', 'No se encontraron cámaras disponibles en tu dispositivo.');
      } else {
        showSuccess('Cámaras encontradas', `Se encontraron ${videoDevices.length} cámara(s) disponible(s).`);
      }
    } catch (error) {
      console.error('Error verifying cameras:', error);
      setCameraVerificationStatus('error');
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          showError('Permiso denegado', 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara en tu navegador.');
        } else if (error.name === 'NotFoundError') {
          showError('No hay cámaras', 'No se encontraron cámaras disponibles en tu dispositivo.');
        } else {
          showError('Error al verificar cámaras', `Error al verificar cámaras: ${error.message}`);
        }
      } else {
        showError('Error inesperado', 'Error inesperado al verificar cámaras.');
      }
    } finally {
      setIsVerifyingCameras(false);
    }
  };

  // Get available cameras on component mount
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(videoDevices);
      } catch (error) {
        console.error('Error getting cameras:', error);
      }
    };

    getCameras();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Settings className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Configuración
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Personaliza tu experiencia de lectura
            </p>
          </div>
        </div>
        

      </div>

      <div className="space-y-6">
        {/* Reading Goals */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Objetivos de Lectura
            </h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Libros por año
            </label>
            <input
              type="number"
              value={config.objetivoLecturaAnual || 0}
              onChange={(e) => handleInputChange('objetivoLecturaAnual', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Notificaciones
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notificaciones de saga completada
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Recibe notificaciones cuando completes una saga
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificacionesSaga || false}
                  onChange={(e) => handleBooleanChange('notificacionesSaga', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notificaciones de objetivo
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Recibe notificaciones cuando alcances tus objetivos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificacionesObjetivo || false}
                  onChange={(e) => handleBooleanChange('notificacionesObjetivo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notificaciones de préstamo
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Recibe recordatorios de libros prestados
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificacionesPrestamo || false}
                  onChange={(e) => handleBooleanChange('notificacionesPrestamo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Configuración de API
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Scan API Provider */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                API para escaneo de ISBN
              </label>
              <select
                value={config.scanApiProvider || 'open-library'}
                onChange={(e) => handleStringChange('scanApiProvider', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="open-library">Open Library (recomendado para escaneo)</option>
                <option value="google-books">Google Books</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Open Library es gratuito y no requiere API key, ideal para escaneo de códigos ISBN.
              </p>
            </div>
            
            {/* Search API Provider */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                API para búsqueda por texto
              </label>
              <select
                value={config.searchApiProvider || 'google-books'}
                onChange={(e) => handleStringChange('searchApiProvider', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="google-books">Google Books (recomendado para búsqueda)</option>
                <option value="open-library">Open Library</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Google Books ofrece mejores resultados de búsqueda y más información detallada.
              </p>
            </div>
            
            {/* Cover API Provider */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                API para portadas de libros
              </label>
              <select
                value={config.coverApiProvider || 'google-books'}
                onChange={(e) => handleStringChange('coverApiProvider', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="google-books">Google Books con fallback (recomendado)</option>
                <option value="open-library">Open Library con fallback</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                El sistema automáticamente intentará con ambas APIs para obtener portadas de alta calidad.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                  <Settings className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Sistema Multi-API con Fallback</p>
                  <p>Si la API principal falla, automáticamente se intenta con la alternativa para máxima robustez.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Settings */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Camera className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Configuración del Escáner
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Camera Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cámara por defecto
              </label>
              <select
                value={config.defaultCameraId || ''}
                onChange={(e) => handleStringChange('defaultCameraId', e.target.value)}
                disabled={availableCameras.length === 0}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">Seleccionar cámara...</option>
                {availableCameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Cámara ${camera.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
              {availableCameras.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  No hay cámaras disponibles. Haz clic en "Verificar cámaras" para detectarlas.
                </p>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleVerifyCameras}
              disabled={isVerifyingCameras}
              className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {isVerifyingCameras ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : cameraVerificationStatus === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : cameraVerificationStatus === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span>
                {isVerifyingCameras ? 'Verificando...' :
                 cameraVerificationStatus === 'success' ? 'Cámaras verificadas' :
                 cameraVerificationStatus === 'error' ? 'Error al verificar' :
                 'Verificar cámaras'}
              </span>
            </motion.button>
            
            {availableCameras.length > 0 && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Cámaras disponibles: {availableCameras.length}
              </div>
            )}
          </div>
        </div>

        {/* Sistema de Puntos */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Sistema de Puntos/Dinero
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Habilitar sistema de puntos */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Habilitar sistema de puntos
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Gana puntos por leer libros y compra libros de tu wishlist
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sistemaPuntosHabilitado || false}
                  onChange={(e) => handleBooleanChange('sistemaPuntosHabilitado', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-yellow-600"></div>
              </label>
            </div>
            
            {/* Modo del sistema */}
            {config.sistemaPuntosHabilitado && (
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Modo del sistema
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Cambia entre sistema de puntos o dinero
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${!config.modoDinero ? 'text-yellow-600 dark:text-yellow-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                    Puntos
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.modoDinero || false}
                      onChange={(e) => handleBooleanChange('modoDinero', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-green-600"></div>
                  </label>
                  <span className={`text-xs ${config.modoDinero ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                    Dinero
                  </span>
                </div>
              </div>
            )}

            {/* Configuración de puntos */}
            {config.sistemaPuntosHabilitado && !config.modoDinero && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Puntos por libro completado
                  </label>
                  <input
                    type="number"
                    value={config.puntosPorLibro || 10}
                    onChange={(e) => handleInputChange('puntosPorLibro', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Puntos por saga completada
                  </label>
                  <input
                    type="number"
                    value={config.puntosPorSaga || 50}
                    onChange={(e) => handleInputChange('puntosPorSaga', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Puntos por página leída
                  </label>
                  <input
                    type="number"
                    value={config.puntosPorPagina || 1}
                    onChange={(e) => handleInputChange('puntosPorPagina', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Puntos para comprar un libro
                  </label>
                  <input
                    type="number"
                    value={config.puntosParaComprar || 25}
                    onChange={(e) => handleInputChange('puntosParaComprar', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Configuración de dinero */}
            {config.sistemaPuntosHabilitado && config.modoDinero && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Dinero por libro completado ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.dineroPorLibro || 5.0}
                    onChange={(e) => handleInputChange('dineroPorLibro', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Dinero por saga completada ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.dineroPorSaga || 25.0}
                    onChange={(e) => handleInputChange('dineroPorSaga', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Dinero por página leída ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.dineroPorPagina || 0.5}
                    onChange={(e) => handleInputChange('dineroPorPagina', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Costo por página al comprar ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.costoPorPagina || 0.25}
                    onChange={(e) => handleInputChange('costoPorPagina', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Configuración de manga - Puntos */}
            {config.sistemaPuntosHabilitado && !config.modoDinero && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Configuración de Manga - Sistema de Puntos
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Puntos por tomo completado
                    </label>
                    <input
                      type="number"
                      value={config.puntosPorTomoManga || 5}
                      onChange={(e) => handleInputChange('puntosPorTomoManga', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Puntos por colección completada
                    </label>
                    <input
                      type="number"
                      value={config.puntosPorColeccionManga || 25}
                      onChange={(e) => handleInputChange('puntosPorColeccionManga', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Configuración de manga - Dinero */}
            {config.sistemaPuntosHabilitado && config.modoDinero && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Configuración de Manga - Sistema de Dinero
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Dinero por tomo completado ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={config.dineroPorTomoManga || 2.5}
                      onChange={(e) => handleInputChange('dineroPorTomoManga', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Dinero por colección completada ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={config.dineroPorColeccionManga || 12.5}
                      onChange={(e) => handleInputChange('dineroPorColeccionManga', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Costo por tomo al comprar ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={config.costoPorTomoManga || 0.5}
                      onChange={(e) => handleInputChange('costoPorTomoManga', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visibilidad de Secciones */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Settings className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Visibilidad de Secciones
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Progreso y Puntos/Dinero
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Muestra tu progreso de lectura y sistema de puntos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarSeccionProgreso !== false}
                  onChange={(e) => handleBooleanChange('mostrarSeccionProgreso', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Lista de Deseos
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Libros que quieres leer en el futuro
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarSeccionWishlist !== false}
                  onChange={(e) => handleBooleanChange('mostrarSeccionWishlist', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pila de Lectura (TBR)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Libros que planeas leer próximamente
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarSeccionTBR !== false}
                  onChange={(e) => handleBooleanChange('mostrarSeccionTBR', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Leyendo Actualmente
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Libros que estás leyendo ahora
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarSeccionLeyendo !== false}
                  onChange={(e) => handleBooleanChange('mostrarSeccionLeyendo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Libros Leídos
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Libros que has terminado de leer
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarSeccionLeidos !== false}
                  onChange={(e) => handleBooleanChange('mostrarSeccionLeidos', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Libros Abandonados
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Libros que decidiste no terminar
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarSeccionAbandonados !== false}
                  onChange={(e) => handleBooleanChange('mostrarSeccionAbandonados', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mis Sagas
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Colecciones de libros relacionados
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarSeccionSagas !== false}
                  onChange={(e) => handleBooleanChange('mostrarSeccionSagas', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Colecciones de Manga
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Gestión de manga y tomos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.mostrarSeccionManga !== false}
                  onChange={(e) => handleBooleanChange('mostrarSeccionManga', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <RotateCcw className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Gestión de Datos
            </h3>
          </div>
          
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleCleanDuplicateSagas}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Limpiar Sagas Duplicadas</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleReset}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Resetear Progreso</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleResetPoints}
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Resetear Solo Puntos</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Dialog Component */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={hideDialog}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        showCancel={dialog.showCancel}
      />
    </div>
  );
};

export default ConfigForm; 