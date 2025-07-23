import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  iconBgColor,
  iconColor,
  children,
  defaultExpanded = true,
  className = ""
}) => {
  // Crear una clave única para localStorage basada en el título
  const storageKey = `section_${title.replace(/\s+/g, '_').toLowerCase()}_expanded`;
  
  // Obtener el estado inicial desde localStorage o usar el valor por defecto
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? JSON.parse(saved) : defaultExpanded;
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Guardar el estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(isExpanded));
  }, [isExpanded, storageKey]);



  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}
    >
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg p-2 -m-2 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${iconBgColor} rounded-lg`}>
              <div className={iconColor}>
                {icon}
              </div>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </button>
      </div>
      
      {isExpanded ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.4, 0.0, 0.2, 1],
            opacity: { duration: 0.2 }
          }}
          className="overflow-hidden"
        >
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="px-4 sm:px-6 py-2 text-center"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            Haz clic en el título para expandir esta sección
          </p>
        </motion.div>
      )}
    </motion.section>
  );
};

export default CollapsibleSection;