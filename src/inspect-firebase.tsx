import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import DatabaseService from './services/databaseService';
import { auth } from './services/firebase';

const InspectFirebase: React.FC = () => {
  const [inspectionResults, setInspectionResults] = useState<string[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const addResult = (message: string) => {
    setInspectionResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const inspectCurrentData = async () => {
    setIsInspecting(true);
    setInspectionResults([]);
    
    try {
      addResult('🔍 Inspeccionando datos actuales de Firebase...');
      
      // Verificar estado de autenticación
      const currentUser = auth.currentUser;
      if (currentUser) {
        addResult(`👤 Usuario actual: ${currentUser.email} (UID: ${currentUser.uid})`);
        
        // Cargar datos del usuario actual
        const hasData = await DatabaseService.hasUserData();
        addResult(`📊 ¿Tiene datos guardados? ${hasData ? 'SÍ' : 'NO'}`);
        
        if (hasData) {
          const appState = await DatabaseService.loadAppState();
          if (appState) {
            addResult(`📚 Libros totales: ${appState.libros.length}`);
            addResult(`📝 Títulos de libros:`);
            appState.libros.forEach((libro, index) => {
              addResult(`  ${index + 1}. "${libro.titulo}" - ${libro.estado} (ID: ${libro.id})`);
            });
            
            addResult(`🗂️ Sagas: ${appState.sagas.length}`);
            if (appState.sagas.length > 0) {
              appState.sagas.forEach((saga, index) => {
                addResult(`  ${index + 1}. "${saga.name}" (${saga.count} libros)`);
              });
            }
            
            // Mostrar estadísticas por estado
            const estadosCounts = appState.libros.reduce((acc, libro) => {
              acc[libro.estado] = (acc[libro.estado] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            addResult(`📊 Libros por estado:`);
            Object.entries(estadosCounts).forEach(([estado, count]) => {
              addResult(`  - ${estado}: ${count} libros`);
            });
          }
        }
      } else {
        addResult('❌ No hay usuario autenticado');
      }
      
    } catch (error) {
      addResult(`❌ Error en inspección: ${error}`);
      console.error('Inspection error:', error);
    }
    
    setIsInspecting(false);
  };

  const clearInspection = () => {
    setInspectionResults([]);
  };

  const testRealTimeSync = async () => {
    setIsInspecting(true);
    addResult('🔄 Probando sincronización en tiempo real...');
    
    try {
      // Agregar un libro de prueba
      const testBook = {
        id: Date.now(),
        titulo: `Libro de Prueba - ${new Date().toLocaleTimeString()}`,
        autor: 'Sistema de Prueba',
        estado: 'tbr' as const,
        historialEstados: [],
        fechaAgregado: Date.now(),
        lecturas: []
      };

      addResult(`📚 Agregando libro de prueba: "${testBook.titulo}"`);
      
      // Cargar estado actual
      const currentState = await DatabaseService.loadAppState();
      if (currentState) {
        const updatedState = {
          ...currentState,
          libros: [...currentState.libros, testBook]
        };
        
        await DatabaseService.saveAppState(updatedState);
        addResult('💾 Libro guardado en Firebase');
        
        // Verificar que se guardó correctamente
        const verificationState = await DatabaseService.loadAppState();
        const bookExists = verificationState?.libros.some(l => l.id === testBook.id);
        
        if (bookExists) {
          addResult('✅ Libro verificado en Firebase');
          addResult(`📊 Total de libros ahora: ${verificationState?.libros.length}`);
        } else {
          addResult('❌ El libro no se encontró después de guardar');
        }
      }
      
    } catch (error) {
      addResult(`❌ Error en prueba de sincronización: ${error}`);
    }
    
    setIsInspecting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-xl p-4">
        <p className="text-yellow-800 dark:text-yellow-200">
          🔒 Debes estar autenticado para inspeccionar Firebase
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 z-50 max-h-96 overflow-hidden">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
        🔍 Inspeccionar Firebase
      </h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={inspectCurrentData}
          disabled={isInspecting}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors text-sm"
        >
          {isInspecting ? 'Inspeccionando...' : 'Inspeccionar Datos'}
        </button>
        
        <button
          onClick={testRealTimeSync}
          disabled={isInspecting}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-md transition-colors text-sm"
        >
          {isInspecting ? 'Probando...' : 'Probar Sincronización'}
        </button>
        
        <button
          onClick={clearInspection}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors text-sm"
        >
          Limpiar
        </button>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-3 max-h-48 overflow-y-auto">
        <div className="text-xs text-slate-800 dark:text-slate-200 space-y-1">
          {inspectionResults.length === 0 ? (
            <p className="text-slate-500">No hay resultados aún...</p>
          ) : (
            inspectionResults.map((result, index) => (
              <div key={index} className="font-mono">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectFirebase;