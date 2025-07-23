import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Settings, Save, RotateCcw, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ConfigForm: React.FC = () => {
  const { state, dispatch } = useAppState();
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
    if (window.confirm('¿Estás seguro de que quieres resetear tu progreso? Esto eliminará todos tus puntos acumulados.')) {
      dispatch({ type: 'RESET_PROGRESS' });
    }
  };

  const handleCleanDuplicateSagas = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar las sagas duplicadas? Esto eliminará las sagas vacías y duplicadas.')) {
      dispatch({ type: 'CLEAN_DUPLICATE_SAGAS' });
      alert('Sagas duplicadas limpiadas correctamente.');
    }
  };

  const handleInputChange = (field: keyof typeof config, value: number) => {
    setConfig(prev => ({ ...prev, [field]: Math.max(0, value) }));
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
        alert('No se encontraron cámaras disponibles en tu dispositivo.');
      } else {
        alert(`Se encontraron ${videoDevices.length} cámara(s) disponible(s).`);
      }
    } catch (error) {
      console.error('Error verifying cameras:', error);
      setCameraVerificationStatus('error');
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Permiso de cámara denegado. Por favor, permite el acceso a la cámara en tu navegador.');
        } else if (error.name === 'NotFoundError') {
          alert('No se encontraron cámaras disponibles en tu dispositivo.');
        } else {
          alert(`Error al verificar cámaras: ${error.message}`);
        }
      } else {
        alert('Error inesperado al verificar cámaras.');
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            Configuración del Sistema
          </h3>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Editar</span>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVerifyCameras}
            disabled={isVerifyingCameras}
            className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            {isVerifyingCameras ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : cameraVerificationStatus === 'success' ? (
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : cameraVerificationStatus === 'error' ? (
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span>
              {isVerifyingCameras 
                ? 'Verificando...' 
                : cameraVerificationStatus === 'success' 
                  ? 'Cámaras OK' 
                  : cameraVerificationStatus === 'error' 
                    ? 'Error Cámaras' 
                    : 'Verificar Cámaras'
              }
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Resetear Progreso</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCleanDuplicateSagas}
            className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Limpiar Sagas</span>
          </motion.button>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Puntos por Libro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1.5 sm:space-y-2"
          >
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Puntos por Libro
            </label>
            <div className="relative">
              <input
                type="number"
                value={config.puntosPorLibro}
                onChange={(e) => handleInputChange('puntosPorLibro', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                placeholder="250"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">pts</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Puntos que ganas al terminar un libro
            </p>
          </motion.div>

          {/* Puntos por Página */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1.5 sm:space-y-2"
          >
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Puntos por Página
            </label>
            <div className="relative">
              <input
                type="number"
                value={config.puntosPorPagina}
                onChange={(e) => handleInputChange('puntosPorPagina', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                placeholder="1"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">pt</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Puntos adicionales por cada página leída
            </p>
          </motion.div>

          {/* Puntos por Saga */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1.5 sm:space-y-2"
          >
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Puntos por Saga
            </label>
            <div className="relative">
              <input
                type="number"
                value={config.puntosPorSaga}
                onChange={(e) => handleInputChange('puntosPorSaga', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                placeholder="500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">pts</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bonus por completar una saga completa
            </p>
          </motion.div>

          {/* Objetivo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-1.5 sm:space-y-2"
          >
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Objetivo de Puntos
            </label>
            <div className="relative">
              <input
                type="number"
                value={config.objetivo}
                onChange={(e) => handleInputChange('objetivo', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                placeholder="1000"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">pts</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Puntos necesarios para desbloquear una compra
            </p>
          </motion.div>
        </div>

        {/* Camera Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-1.5 sm:space-y-2"
        >
          <div className="flex items-center justify-between">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              Cámara Preferida para Escáner
            </label>
            {cameraVerificationStatus === 'success' && (
              <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="h-3 w-3" />
                <span>Verificada</span>
              </div>
            )}
            {cameraVerificationStatus === 'error' && (
              <div className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                <span>Error</span>
              </div>
            )}
          </div>
          
          {availableCameras.length > 0 ? (
            <div className="relative">
              <select
                value={config.cameraPreference || 0}
                onChange={(e) => setConfig(prev => ({ ...prev, cameraPreference: parseInt(e.target.value) }))}
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
              >
                {availableCameras.map((camera, index) => (
                  <option key={camera.deviceId} value={index}>
                    Cámara {index + 1}: {camera.label || 'Cámara sin nombre'}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Camera className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </div>
            </div>
          ) : (
            <div className="px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>No hay cámaras disponibles. Haz clic en "Verificar Cámaras" para configurar.</span>
            </div>
          )}
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {availableCameras.length > 0 
              ? 'Cámara que se usará por defecto al escanear códigos de barras'
              : 'Haz clic en "Verificar Cámaras" para solicitar permisos y detectar cámaras disponibles'
            }
          </p>
        </motion.div>

        {/* Action Buttons */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4"
          >
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-success-500 hover:bg-success-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
            >
              <Save className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Guardar Cambios</span>
            </motion.button>
            
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setConfig(state.config);
                setIsEditing(false);
              }}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              Cancelar
            </motion.button>
          </motion.div>
        )}
      </form>

      {/* Current Configuration Display */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700"
        >
          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
            Configuración Actual
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-slate-600 dark:text-slate-400">Por libro:</span>
              <span className="block font-semibold text-slate-900 dark:text-slate-100">
                {config.puntosPorLibro} pts
              </span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Por página:</span>
              <span className="block font-semibold text-slate-900 dark:text-slate-100">
                {config.puntosPorPagina} pt
              </span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Por saga:</span>
              <span className="block font-semibold text-slate-900 dark:text-slate-100">
                {config.puntosPorSaga} pts
              </span>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400">Objetivo:</span>
              <span className="block font-semibold text-slate-900 dark:text-slate-100">
                {config.objetivo} pts
              </span>
            </div>
          </div>
          
          {/* Camera Configuration Display */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Camera className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cámara Preferida
                </span>
              </div>
              {cameraVerificationStatus === 'success' && (
                <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  <span>Verificada</span>
                </div>
              )}
              {cameraVerificationStatus === 'error' && (
                <div className="flex items-center space-x-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>Error</span>
                </div>
              )}
            </div>
            <span className="text-xs sm:text-sm text-slate-900 dark:text-slate-100">
              {availableCameras.length > 0 
                ? (config.cameraPreference !== undefined && config.cameraPreference < availableCameras.length
                    ? `Cámara ${config.cameraPreference + 1}: ${availableCameras[config.cameraPreference]?.label || 'Cámara sin nombre'}`
                    : 'Automática (mejor cámara disponible)'
                  )
                : 'No hay cámaras configuradas'
              }
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConfigForm; 