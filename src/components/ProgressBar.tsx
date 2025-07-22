import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { motion } from 'framer-motion';
import { Target, Gift, TrendingUp } from 'lucide-react';

const ProgressBar: React.FC = () => {
  const { state } = useAppState();
  const { progreso, config, compraDesbloqueada } = state;
  const porcentaje = Math.min((progreso / config.objetivo) * 100, 100);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-3 sm:p-4 border border-primary-200 dark:border-primary-700"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-primary-500 rounded-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-primary-700 dark:text-primary-300">
                Puntos Actuales
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary-900 dark:text-primary-100">
                {progreso}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-xl p-3 sm:p-4 border border-secondary-200 dark:border-secondary-700"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-secondary-500 rounded-lg">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Objetivo
              </p>
              <p className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {config.objetivo}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl p-3 sm:p-4 border sm:col-span-2 lg:col-span-1 ${
            compraDesbloqueada
              ? 'bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-success-200 dark:border-success-700'
              : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${
              compraDesbloqueada ? 'bg-success-500' : 'bg-slate-500'
            }`}>
              <Gift className={`h-4 w-4 sm:h-5 sm:w-5 ${
                compraDesbloqueada ? 'text-white' : 'text-white'
              }`} />
            </div>
            <div>
              <p className={`text-xs sm:text-sm font-medium ${
                compraDesbloqueada 
                  ? 'text-success-700 dark:text-success-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                Estado
              </p>
              <p className={`text-sm sm:text-lg font-bold ${
                compraDesbloqueada 
                  ? 'text-success-900 dark:text-success-100'
                  : 'text-slate-900 dark:text-slate-100'
              }`}>
                {compraDesbloqueada ? '¡Compra Desbloqueada!' : 'Bloqueado'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-2 sm:space-y-3"
      >
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Progreso hacia el objetivo
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            {Math.round(porcentaje)}%
          </span>
        </div>
        
        <div className="relative h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${porcentaje}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              compraDesbloqueada
                ? 'bg-gradient-to-r from-success-500 to-success-600'
                : 'bg-gradient-to-r from-primary-500 to-secondary-500'
            }`}
          />
          
          {/* Shimmer effect */}
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>0 puntos</span>
          <span>{config.objetivo} puntos</span>
        </div>
      </motion.div>

      {/* Configuration Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700"
      >
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
          Configuración de Puntos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Por libro:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {config.puntosPorLibro} pts
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Por página:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {config.puntosPorPagina} pt
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Por saga:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {config.puntosPorSaga} pts
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressBar; 