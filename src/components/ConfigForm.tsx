import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/FirebaseAppStateContext';
import { motion } from 'framer-motion';
import { Settings, Save, RotateCcw, Camera, CheckCircle, AlertCircle, Loader2, Target, Bell, Trophy, History, Database, Download, Upload } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';
import Dialog from './Dialog';

const ConfigForm: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { dialog, showSuccess, showError, hideDialog } = useDialog();
  const [config, setConfig] = useState(state.config);
  const [isEditing, setIsEditing] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [isVerifyingCameras, setIsVerifyingCameras] = useState(false);
  const [cameraVerificationStatus, setCameraVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_CONFIG', payload: config });
    setIsEditing(false);
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear tu progreso? Esto eliminará todos tus datos de lectura.')) {
      dispatch({ type: 'IMPORT_DATA', payload: { libros: [], sagas: [] } });
    }
  };

  const handleCleanDuplicateSagas = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar las sagas duplicadas? Esto eliminará las sagas vacías y duplicadas.')) {
      dispatch({ type: 'CLEAN_DUPLICATE_SAGAS' });
      showSuccess('Sagas limpiadas', 'Sagas duplicadas limpiadas correctamente.');
    }
  };

  const handleClearScanHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar el historial de escaneos? Esta acción no se puede deshacer.')) {
      dispatch({ type: 'CLEAR_SCAN_HISTORY' });
      showSuccess('Historial limpiado', 'Historial de escaneos limpiado correctamente.');
    }
  };

  const handleExportData = () => {
    try {
      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        config: state.config,
        libros: state.libros,
        sagas: state.sagas,
        scanHistory: state.scanHistory,
        searchHistory: state.searchHistory,
        puntosActuales: state.puntosActuales,
        puntosGanados: state.puntosGanados,
        librosCompradosConPuntos: state.librosCompradosConPuntos
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `biblioteca-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('Datos exportados', 'Tus datos han sido exportados correctamente.');
    } catch (error) {
      console.error('Error exporting data:', error);
      showError('Error al exportar', 'Error al exportar los datos. Inténtalo de nuevo.');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string);
            
            if (window.confirm('¿Estás seguro de que quieres importar estos datos? Esto sobrescribirá tus datos actuales.')) {
              dispatch({ 
                type: 'IMPORT_DATA', 
                payload: {
                  libros: importedData.libros || [],
                  sagas: importedData.sagas || [],
                  config: importedData.config || {},
                  scanHistory: importedData.scanHistory || [],
                  searchHistory: importedData.searchHistory || [],
                  puntosActuales: importedData.puntosActuales || 0,
                  puntosGanados: importedData.puntosGanados || 0,
                  librosCompradosConPuntos: importedData.librosCompradosConPuntos || 0
                }
              });
              showSuccess('Datos importados', 'Datos importados correctamente.');
            }
          } catch (error) {
            console.error('Error importing data:', error);
            showError('Error al importar', 'El archivo no es válido o está corrupto.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleInputChange = (field: keyof typeof config, value: number) => {
    setConfig(prev => ({ ...prev, [field]: Math.max(0, value) }));
  };

  const handleBooleanChange = (field: keyof typeof config, value: boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleStringChange = (field: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
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
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setConfig(state.config);
                  setIsEditing(false);
                }}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Guardar</span>
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Editar
            </motion.button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Libros por año
              </label>
              <input
                type="number"
                value={config.objetivoLecturaAnual || 0}
                onChange={(e) => handleInputChange('objetivoLecturaAnual', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Páginas por año
              </label>
              <input
                type="number"
                value={config.objetivoPaginasAnual || 0}
                onChange={(e) => handleInputChange('objetivoPaginasAnual', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                min="0"
              />
            </div>
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
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 disabled:opacity-50"></div>
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
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 disabled:opacity-50"></div>
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
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
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
                disabled={!isEditing || availableCameras.length === 0}
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
              disabled={isVerifyingCameras || !isEditing}
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
              Sistema de Puntos
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
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-yellow-600 disabled:opacity-50"></div>
              </label>
            </div>
            
            {/* Configuración de puntos */}
            {config.sistemaPuntosHabilitado && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Puntos por libro completado
                  </label>
                  <input
                    type="number"
                    value={config.puntosPorLibro || 10}
                    onChange={(e) => handleInputChange('puntosPorLibro', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
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
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
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
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
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
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Historial de Escaneos */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Historial de Escaneos
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Escaneos registrados
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {state.scanHistory.length} escaneos en el historial
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleClearScanHistory}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>Limpiar Historial de Escaneos</span>
            </motion.button>
          </div>
        </div>

        {/* Exportar/Importar Datos */}
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Exportar/Importar Datos
            </h3>
          </div>
          
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleExportData}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Datos</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleImportData}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Importar Datos</span>
            </motion.button>
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
          </div>
        </div>
      </form>

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