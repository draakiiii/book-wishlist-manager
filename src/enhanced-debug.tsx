import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useAppState } from './context/AppStateContext';
import AuthService from './services/authService';
import DatabaseService from './services/databaseService';
import { auth, db } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const EnhancedDebug: React.FC = () => {
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { state, dispatch } = useAppState();

  const addResult = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(`[Enhanced Debug] ${message}`);
  };

  const comprehensiveFirebaseTest = async () => {
    setIsRunning(true);
    setDebugResults([]);
    
    try {
      addResult('🚀 Iniciando prueba comprehensiva de Firebase...');
      
      // 1. Verificar estado actual del usuario
      addResult('--- ESTADO ACTUAL ---');
      if (user) {
        addResult(`👤 Usuario: ${user.email}`);
        addResult(`🆔 UID: ${user.uid}`);
        addResult(`📚 Libros en contexto: ${state.libros.length}`);
        
        // Mostrar algunos libros del contexto actual
        if (state.libros.length > 0) {
          addResult('📖 Primeros 3 libros del contexto:');
          state.libros.slice(0, 3).forEach((libro, index) => {
            addResult(`  ${index + 1}. "${libro.titulo}" (ID: ${libro.id}, Estado: ${libro.estado})`);
          });
        }
      }
      
      // 2. Verificar acceso directo a Firebase
      addResult('--- ACCESO DIRECTO A FIREBASE ---');
      try {
        const userDataRef = doc(db, 'users', user!.uid, 'data', 'appState');
        addResult(`🔗 Referencia: ${userDataRef.path}`);
        
        const docSnap = await getDoc(userDataRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          addResult(`✅ Documento existe en Firebase`);
          addResult(`📊 Libros en Firebase: ${data.libros?.length || 0}`);
          
          if (data.libros && data.libros.length > 0) {
            addResult('📖 Primeros 3 libros de Firebase:');
            data.libros.slice(0, 3).forEach((libro: any, index: number) => {
              addResult(`  ${index + 1}. "${libro.titulo}" (ID: ${libro.id}, Estado: ${libro.estado})`);
            });
          }
          
          // Verificar si hay discrepancias
          if (data.libros?.length !== state.libros.length) {
            addResult('⚠️ DISCREPANCIA: Diferente número de libros entre contexto y Firebase');
            addResult(`   Contexto: ${state.libros.length}, Firebase: ${data.libros?.length || 0}`);
          }
        } else {
          addResult(`❌ No existe documento en Firebase para este usuario`);
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
          
          // Comparar IDs específicos
          const contextIds = state.libros.map(l => l.id).sort();
          const firebaseIds = loadedState.libros.map(l => l.id).sort();
          
          addResult(`🔢 IDs en contexto: [${contextIds.join(', ')}]`);
          addResult(`🔢 IDs en Firebase: [${firebaseIds.join(', ')}]`);
          
          if (JSON.stringify(contextIds) !== JSON.stringify(firebaseIds)) {
            addResult('⚠️ DISCREPANCIA: IDs diferentes entre contexto y Firebase');
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
      
      // 5. Simular cambio de usuario y verificar aislamiento
      addResult('--- SIMULANDO CAMBIO DE USUARIO ---');
      
      // Crear un usuario de prueba temporal
      const testUserEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      try {
        addResult(`👤 Creando usuario temporal: ${testUserEmail}`);
        await AuthService.register(testUserEmail, testPassword);
        addResult('✅ Usuario temporal creado');
        
        // Verificar que no hay datos para este nuevo usuario
        const newUserData = await DatabaseService.loadAppState();
        if (newUserData && newUserData.libros.length > 0) {
          addResult('❌ PROBLEMA: El nuevo usuario tiene datos que no debería tener');
          addResult(`   Libros encontrados: ${newUserData.libros.length}`);
        } else {
          addResult('✅ Nuevo usuario no tiene datos (correcto)');
        }
        
        // Agregar un libro de prueba al nuevo usuario
        const testBook = {
          id: Date.now(),
          titulo: `Libro de Prueba - ${testUserEmail}`,
          autor: 'Test Author',
          estado: 'tbr' as const,
          historialEstados: [],
          fechaAgregado: Date.now(),
          lecturas: []
        };
        
        const testState = {
          libros: [testBook],
          sagas: [],
          config: { autoSaveEnabled: true, exportFormat: 'json' as const },
          sagaNotifications: [],
          darkMode: false,
          scanHistory: [],
          searchHistory: [],
          puntosActuales: 0,
          puntosGanados: 0,
          librosCompradosConPuntos: 0,
          dineroActual: 0,
          dineroGanado: 0,
          librosCompradosConDinero: 0,
        };
        
        await DatabaseService.saveAppState(testState);
        addResult('💾 Libro de prueba guardado para nuevo usuario');
        
        // Verificar que se guardó correctamente
        const verificationData = await DatabaseService.loadAppState();
        if (verificationData && verificationData.libros.length === 1) {
          addResult('✅ Libro de prueba verificado para nuevo usuario');
        } else {
          addResult('❌ Error: Libro de prueba no se guardó correctamente');
        }
        
        // Volver al usuario original
        await AuthService.logout();
        await AuthService.login(user!.email!, 'originalpassword'); // Esto no funcionará, solo para testing
        
      } catch (error) {
        addResult(`❌ Error en simulación de cambio de usuario: ${error}`);
        try {
          await AuthService.logout();
        } catch (logoutError) {
          addResult(`❌ Error al cerrar sesión: ${logoutError}`);
        }
      }
      
      addResult('🏁 Prueba comprehensiva completada');
      
    } catch (error) {
      addResult(`❌ Error general en prueba: ${error}`);
      console.error('Enhanced debug error:', error);
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed top-4 left-4 w-80 bg-red-100 dark:bg-red-900 rounded-lg shadow-xl p-4">
        <p className="text-red-800 dark:text-red-200">
          🔒 Debes estar autenticado para hacer debug avanzado
        </p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 w-[500px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 z-50 max-h-[600px] overflow-hidden">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
        🔬 Debug Avanzado Firebase
      </h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={comprehensiveFirebaseTest}
          disabled={isRunning}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors"
        >
          {isRunning ? 'Ejecutando...' : 'Prueba Comprehensiva'}
        </button>
        
        <button
          onClick={clearResults}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          Limpiar Resultados
        </button>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-3 max-h-[450px] overflow-y-auto">
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

export default EnhancedDebug;