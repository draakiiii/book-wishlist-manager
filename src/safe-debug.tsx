import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useAppState } from './context/AppStateContext';
import DatabaseService from './services/databaseService';
import { auth, db } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const SafeDebug: React.FC = () => {
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { state, dispatch } = useAppState();

  const addResult = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(`[Safe Debug] ${message}`);
  };

  const safeFirebaseTest = async () => {
    setIsRunning(true);
    setDebugResults([]);
    
    try {
      addResult('🔍 Iniciando diagnóstico seguro de sincronización...');
      
      // 1. Verificar estado actual del usuario
      addResult('--- ESTADO ACTUAL ---');
      if (user) {
        addResult(`👤 Usuario: ${user.email}`);
        addResult(`🆔 UID: ${user.uid}`);
        addResult(`📚 Libros en contexto React: ${state.libros.length}`);
        
        // Mostrar libros del contexto actual
        if (state.libros.length > 0) {
          addResult('📖 Libros en el contexto de React:');
          state.libros.forEach((libro, index) => {
            addResult(`  ${index + 1}. "${libro.titulo}" (ID: ${libro.id}, Estado: ${libro.estado})`);
          });
        } else {
          addResult('📖 No hay libros en el contexto de React');
        }
      }
      
      // 2. Verificar acceso directo a Firebase
      addResult('--- ACCESO DIRECTO A FIREBASE ---');
      try {
        const userDataRef = doc(db, 'users', user!.uid, 'data', 'appState');
        addResult(`🔗 Ruta Firebase: ${userDataRef.path}`);
        
        const docSnap = await getDoc(userDataRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          addResult(`✅ Documento existe en Firebase`);
          addResult(`📊 Libros en Firebase (raw): ${data.libros?.length || 0}`);
          
          if (data.libros && data.libros.length > 0) {
            addResult('📖 Libros encontrados en Firebase:');
            data.libros.forEach((libro: any, index: number) => {
              addResult(`  ${index + 1}. "${libro.titulo}" (ID: ${libro.id}, Estado: ${libro.estado})`);
            });
          } else {
            addResult('📖 No hay libros en Firebase (array vacío o undefined)');
          }
          
          // Verificar si hay discrepancias
          const firebaseCount = data.libros?.length || 0;
          const contextCount = state.libros.length;
          
          if (firebaseCount !== contextCount) {
            addResult('🚨 DISCREPANCIA ENCONTRADA:');
            addResult(`   📊 Firebase tiene: ${firebaseCount} libros`);
            addResult(`   📊 Contexto tiene: ${contextCount} libros`);
            addResult('   ➡️ ESTE ES EL PROBLEMA DE SINCRONIZACIÓN');
          } else {
            addResult('✅ Firebase y contexto tienen el mismo número de libros');
          }
          
          // Verificar metadatos
          if (data.lastUpdated) {
            addResult(`🕒 Última actualización: ${new Date(data.lastUpdated.seconds * 1000).toLocaleString()}`);
          }
          if (data.version) {
            addResult(`📋 Versión: ${data.version}`);
          }
          
        } else {
          addResult(`❌ No existe documento en Firebase para este usuario`);
          addResult('   ➡️ Esto explicaría por qué no hay libros en el contexto');
        }
      } catch (error) {
        addResult(`❌ Error accediendo Firebase directamente: ${error}`);
      }
      
      // 3. Probar carga desde DatabaseService
      addResult('--- PROBANDO DATABASE SERVICE ---');
      try {
        const loadedState = await DatabaseService.loadAppState();
        if (loadedState) {
          addResult(`✅ DatabaseService cargó: ${loadedState.libros.length} libros`);
          
          if (loadedState.libros.length > 0) {
            addResult('📖 Libros cargados por DatabaseService:');
            loadedState.libros.slice(0, 3).forEach((libro: any, index: number) => {
              addResult(`  ${index + 1}. "${libro.titulo}" (ID: ${libro.id})`);
            });
          }
          
          // Comparar con el contexto
          if (loadedState.libros.length !== state.libros.length) {
            addResult('🚨 DISCREPANCIA CON DATABASE SERVICE:');
            addResult(`   📊 DatabaseService: ${loadedState.libros.length} libros`);
            addResult(`   📊 Contexto: ${state.libros.length} libros`);
          }
        } else {
          addResult('❌ DatabaseService no encontró datos');
        }
      } catch (error) {
        addResult(`❌ Error con DatabaseService: ${error}`);
      }
      
      // 4. Verificar configuración de autenticación
      addResult('--- VERIFICANDO AUTENTICACIÓN ---');
      const currentUser = auth.currentUser;
      if (currentUser) {
        addResult(`✅ auth.currentUser: ${currentUser.email}`);
        addResult(`🆔 auth.currentUser.uid: ${currentUser.uid}`);
        
        if (currentUser.uid !== user?.uid) {
          addResult('⚠️ DISCREPANCIA: UIDs diferentes entre auth.currentUser y contexto');
        }
      } else {
        addResult('❌ auth.currentUser es null');
      }
      
      // 5. Diagnóstico final
      addResult('--- DIAGNÓSTICO FINAL ---');
      if (state.libros.length === 0) {
        addResult('🔍 ANÁLISIS: El contexto no tiene libros');
        addResult('   Posibles causas:');
        addResult('   1. Los datos no se están cargando desde Firebase al inicializar');
        addResult('   2. Hay un problema en el AppStateContext useEffect');
        addResult('   3. Los datos se están perdiendo en algún momento del ciclo');
        addResult('   4. La función loadStateFromFirebase no funciona correctamente');
      }
      
      addResult('🏁 Diagnóstico seguro completado (sin logout)');
      
    } catch (error) {
      addResult(`❌ Error general en diagnóstico: ${error}`);
      console.error('Safe debug error:', error);
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  const forceReloadFromFirebase = async () => {
    setIsRunning(true);
    addResult('🔄 Forzando recarga desde Firebase...');
    
    try {
      const loadedState = await DatabaseService.loadAppState();
      if (loadedState) {
        addResult(`📚 Cargando ${loadedState.libros.length} libros en el contexto...`);
        dispatch({ type: 'IMPORT_DATA', payload: loadedState });
        addResult('✅ Datos importados al contexto');
        addResult(`📊 Contexto ahora tiene: ${loadedState.libros.length} libros`);
      } else {
        addResult('❌ No se encontraron datos para importar');
      }
    } catch (error) {
      addResult(`❌ Error forzando recarga: ${error}`);
    }
    
    setIsRunning(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed top-16 left-4 w-80 bg-red-100 dark:bg-red-900 rounded-lg shadow-xl p-4">
        <p className="text-red-800 dark:text-red-200">
          🔒 Debes estar autenticado para hacer debug seguro
        </p>
      </div>
    );
  }

  return (
    <div className="fixed top-16 left-4 w-[520px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 z-50 max-h-[550px] overflow-hidden border-2 border-green-500">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
        🛡️ Debug Seguro (Sin Logout)
      </h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={safeFirebaseTest}
          disabled={isRunning}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors"
        >
          {isRunning ? 'Diagnosticando...' : '🔍 Diagnóstico Seguro'}
        </button>
        
        <button
          onClick={forceReloadFromFirebase}
          disabled={isRunning}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
        >
          {isRunning ? 'Recargando...' : '🔄 Forzar Recarga desde Firebase'}
        </button>
        
        <button
          onClick={clearResults}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          🧹 Limpiar Resultados
        </button>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-3 max-h-[380px] overflow-y-auto">
        <div className="text-xs text-slate-800 dark:text-slate-200 space-y-1">
          {debugResults.length === 0 ? (
            <p className="text-slate-500">No hay resultados aún...</p>
          ) : (
            debugResults.map((result, index) => (
              <div key={index} className="font-mono whitespace-pre-wrap">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeDebug;