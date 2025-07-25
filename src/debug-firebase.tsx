import React, { useState } from 'react';
import AuthService from './services/authService';
import DatabaseService from './services/databaseService';
import { AppState } from './types';

const DebugFirebase: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebaseIsolation = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('🔥 Iniciando prueba de aislamiento de datos de Firebase...');

      // Datos de prueba para dos usuarios diferentes
      const testUser1 = {
        email: 'test1@example.com',
        password: 'testpassword123',
        appState: {
          libros: [
            { 
              id: 1, 
              titulo: 'Usuario 1 - El Hobbit', 
              autor: 'J.R.R. Tolkien',
              estado: 'leido' as const,
              historialEstados: [],
              fechaAgregado: Date.now(),
              lecturas: []
            },
            { 
              id: 2, 
              titulo: 'Usuario 1 - 1984', 
              autor: 'George Orwell',
              estado: 'wishlist' as const,
              historialEstados: [],
              fechaAgregado: Date.now(),
              lecturas: []
            }
          ],
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
        } as AppState
      };

      const testUser2 = {
        email: 'test2@example.com',
        password: 'testpassword456',
        appState: {
          libros: [
            { 
              id: 3, 
              titulo: 'Usuario 2 - Harry Potter', 
              autor: 'J.K. Rowling',
              estado: 'leyendo' as const,
              historialEstados: [],
              fechaAgregado: Date.now(),
              lecturas: []
            },
            { 
              id: 4, 
              titulo: 'Usuario 2 - Dune', 
              autor: 'Frank Herbert',
              estado: 'tbr' as const,
              historialEstados: [],
              fechaAgregado: Date.now(),
              lecturas: []
            }
          ],
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
        } as AppState
      };

      // Probar Usuario 1
      addResult('📚 Probando Usuario 1...');
      try {
        await AuthService.login(testUser1.email, testUser1.password);
        addResult('✅ Usuario 1 logueado exitosamente');
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          addResult('👤 Creando Usuario 1...');
          await AuthService.register(testUser1.email, testUser1.password);
          addResult('✅ Usuario 1 creado y logueado');
        } else {
          throw error;
        }
      }

      // Guardar datos del Usuario 1
      await DatabaseService.saveAppState(testUser1.appState);
      addResult('💾 Datos del Usuario 1 guardados');

      // Cargar y verificar datos del Usuario 1
      const user1Data = await DatabaseService.loadAppState();
      if (user1Data) {
        addResult(`📖 Usuario 1 - Libros cargados: ${user1Data.libros.map(l => l.titulo).join(', ')}`);
      }

      // Cerrar sesión Usuario 1
      await AuthService.logout();
      addResult('👋 Usuario 1 cerró sesión\n');

      // Probar Usuario 2
      addResult('📚 Probando Usuario 2...');
      try {
        await AuthService.login(testUser2.email, testUser2.password);
        addResult('✅ Usuario 2 logueado exitosamente');
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          addResult('👤 Creando Usuario 2...');
          await AuthService.register(testUser2.email, testUser2.password);
          addResult('✅ Usuario 2 creado y logueado');
        } else {
          throw error;
        }
      }

      // Guardar datos del Usuario 2
      await DatabaseService.saveAppState(testUser2.appState);
      addResult('💾 Datos del Usuario 2 guardados');

      // Cargar y verificar datos del Usuario 2
      const user2Data = await DatabaseService.loadAppState();
      if (user2Data) {
        addResult(`📖 Usuario 2 - Libros cargados: ${user2Data.libros.map(l => l.titulo).join(', ')}`);
      }

      // Cerrar sesión Usuario 2
      await AuthService.logout();
      addResult('👋 Usuario 2 cerró sesión\n');

      // Verificación final - Volver a loguearse como Usuario 1
      addResult('🔍 Verificación final - Aislamiento de datos del Usuario 1...');
      await AuthService.login(testUser1.email, testUser1.password);
      const finalUser1Data = await DatabaseService.loadAppState();
      
      if (finalUser1Data) {
        addResult(`📖 Usuario 1 - Libros finales: ${finalUser1Data.libros.map(l => l.titulo).join(', ')}`);

        // Verificar si los datos están correctamente aislados
        const user1HasUser2Books = finalUser1Data.libros.some(book => 
          testUser2.appState.libros.some(u2Book => u2Book.id === book.id)
        );

        if (user1HasUser2Books) {
          addResult('❌ ERROR: ¡Usuario 1 tiene libros del Usuario 2! ¡El aislamiento de datos está roto!');
        } else {
          addResult('✅ ÉXITO: ¡El aislamiento de datos funciona correctamente!');
        }
      }

      await AuthService.logout();

    } catch (error) {
      addResult(`❌ Prueba falló: ${error}`);
      console.error('Test error:', error);
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 z-50 max-h-96 overflow-hidden">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
        🔧 Debug Firebase
      </h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testFirebaseIsolation}
          disabled={isRunning}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
        >
          {isRunning ? 'Probando...' : 'Probar Aislamiento Firebase'}
        </button>
        
        <button
          onClick={clearResults}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          Limpiar Resultados
        </button>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-3 max-h-64 overflow-y-auto">
        <div className="text-xs text-slate-800 dark:text-slate-200 space-y-1">
          {testResults.length === 0 ? (
            <p className="text-slate-500">No hay resultados aún...</p>
          ) : (
            testResults.map((result, index) => (
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

export default DebugFirebase;