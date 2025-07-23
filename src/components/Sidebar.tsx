import React from 'react';
import { motion } from 'framer-motion';
import { X, Settings } from 'lucide-react';
import ConfigForm from './ConfigForm';
import { useAppState } from '../context/FirebaseAppStateContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { dispatch } = useAppState();

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-800 shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <Settings className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Configuración
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <ConfigForm />
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default Sidebar; 