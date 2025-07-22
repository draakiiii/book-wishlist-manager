import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Settings, Save, RotateCcw } from 'lucide-react';

const ConfigForm: React.FC = () => {
  const { state, dispatch } = useAppState();
  const [config, setConfig] = useState(state.config);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleInputChange = (field: keyof typeof config, value: number) => {
    setConfig(prev => ({ ...prev, [field]: Math.max(0, value) }));
  };

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
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Resetear Progreso</span>
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
        </motion.div>
      )}
    </div>
  );
};

export default ConfigForm; 