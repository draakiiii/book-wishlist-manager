import React, { createContext, useContext, useState, useCallback } from 'react';

interface SectionStateContextType {
  expandAll: () => void;
  collapseAll: () => void;
  toggleAll: () => void;
  isAllExpanded: boolean;
}

const SectionStateContext = createContext<SectionStateContextType | undefined>(undefined);

export const useSectionState = () => {
  const context = useContext(SectionStateContext);
  if (!context) {
    throw new Error('useSectionState must be used within a SectionStateProvider');
  }
  return context;
};

interface SectionStateProviderProps {
  children: React.ReactNode;
}

export const SectionStateProvider: React.FC<SectionStateProviderProps> = ({ children }) => {
  const [isAllExpanded, setIsAllExpanded] = useState(true);

  const expandAll = useCallback(() => {
    // Disparar un evento personalizado para que todas las secciones se expandan
    window.dispatchEvent(new CustomEvent('expandAllSections'));
    setIsAllExpanded(true);
  }, []);

  const collapseAll = useCallback(() => {
    // Disparar un evento personalizado para que todas las secciones se colapsen
    window.dispatchEvent(new CustomEvent('collapseAllSections'));
    setIsAllExpanded(false);
  }, []);

  const toggleAll = useCallback(() => {
    if (isAllExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  }, [isAllExpanded, expandAll, collapseAll]);

  const value = {
    expandAll,
    collapseAll,
    toggleAll,
    isAllExpanded,
  };

  return (
    <SectionStateContext.Provider value={value}>
      {children}
    </SectionStateContext.Provider>
  );
};