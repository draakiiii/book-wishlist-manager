import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, ChevronDown } from 'lucide-react';
import ConfigForm from './ConfigForm';

const CollapsibleConfig: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Header - Always visible */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-2 -m-2 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Settings className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Configuración
            </h2>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </motion.div>
        </button>
      </div>
      
      {/* Collapsible Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="p-4 sm:p-6">
            <ConfigForm />
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default CollapsibleConfig; 