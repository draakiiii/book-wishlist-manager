import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { AppState, Libro, Saga, ScanHistory, Configuracion } from '../types';

export class DatabaseService {
  private static getUserId(): string {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    return user.uid;
  }

  private static getUserDocRef() {
    const userId = this.getUserId();
    return doc(db, 'users', userId);
  }

  private static getUserDataRef() {
    const userId = this.getUserId();
    return doc(db, 'users', userId, 'data', 'appState');
  }

  // Función para limpiar valores undefined del estado
  private static cleanStateForFirebase(state: any): any {
    const cleanObject = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return null;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      }
      
      if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            cleaned[key] = cleanObject(value);
          }
        }
        return cleaned;
      }
      
      return obj;
    };
    
    return cleanObject(state);
  }

  // Guardar todo el estado de la aplicación
  static async saveAppState(state: AppState): Promise<void> {
    try {
      const userDataRef = this.getUserDataRef();
      console.log('DatabaseService.saveAppState: Saving to ref:', userDataRef.path);
      console.log('DatabaseService.saveAppState: State to save:', {
        librosCount: state.libros.length,
        wishlistCount: state.libros.filter(l => l.estado === 'wishlist').length,
        tbrCount: state.libros.filter(l => l.estado === 'tbr').length,
        libros: state.libros.map(l => ({ id: l.id, titulo: l.titulo, estado: l.estado }))
      });
      
      const cleanedState = this.cleanStateForFirebase(state);
      console.log('DatabaseService.saveAppState: Cleaned state:', {
        librosCount: cleanedState.libros?.length || 0,
        wishlistCount: cleanedState.libros?.filter((l: any) => l.estado === 'wishlist').length || 0,
        tbrCount: cleanedState.libros?.filter((l: any) => l.estado === 'tbr').length || 0
      });
      
      const dataToSave = {
        ...cleanedState,
        lastUpdated: serverTimestamp(),
        version: '1.0'
      };
      
      console.log('DatabaseService.saveAppState: Final data being saved to Firebase:', {
        librosCount: dataToSave.libros?.length || 0,
        librosArray: dataToSave.libros,
        hasLibrosProperty: 'libros' in dataToSave,
        dataKeys: Object.keys(dataToSave)
      });
      
      await setDoc(userDataRef, dataToSave);
      
      console.log('DatabaseService.saveAppState: Successfully saved to Firebase');
    } catch (error) {
      console.error('Error saving app state:', error);
      throw error;
    }
  }

  // Cargar todo el estado de la aplicación
  static async loadAppState(): Promise<AppState | null> {
    try {
      const userDataRef = this.getUserDataRef();
      console.log('DatabaseService.loadAppState: Loading from ref:', userDataRef.path);
      
      const docSnap = await getDoc(userDataRef);
      console.log('DatabaseService.loadAppState: Document exists:', docSnap.exists());
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('DatabaseService.loadAppState: Raw data from Firebase:', data);
        console.log('DatabaseService.loadAppState: Detailed libros array:', {
          librosLength: data.libros?.length || 0,
          librosArray: data.libros,
          hasLibrosProperty: 'libros' in data,
          dataKeys: Object.keys(data)
        });
        
        // Remover campos de Firebase que no son parte del estado
        const { lastUpdated, version, ...appState } = data;
        console.log('DatabaseService.loadAppState: Cleaned app state:', {
          librosCount: appState.libros?.length || 0,
          wishlistCount: appState.libros?.filter((l: any) => l.estado === 'wishlist').length || 0,
          tbrCount: appState.libros?.filter((l: any) => l.estado === 'tbr').length || 0
        });
        
        return appState as AppState;
      }
      console.log('DatabaseService.loadAppState: Document does not exist');
      return null;
    } catch (error) {
      console.error('Error loading app state:', error);
      throw error;
    }
  }

  // Guardar solo los libros
  static async saveBooks(libros: Libro[]): Promise<void> {
    try {
      const userDataRef = this.getUserDataRef();
      const cleanedLibros = this.cleanStateForFirebase(libros);
      
      await updateDoc(userDataRef, {
        libros: cleanedLibros,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving books:', error);
      throw error;
    }
  }

  // Guardar solo las sagas
  static async saveSagas(sagas: Saga[]): Promise<void> {
    try {
      const userDataRef = this.getUserDataRef();
      const cleanedSagas = this.cleanStateForFirebase(sagas);
      
      await updateDoc(userDataRef, {
        sagas: cleanedSagas,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving sagas:', error);
      throw error;
    }
  }

  // Guardar solo la configuración
  static async saveConfig(config: Configuracion): Promise<void> {
    try {
      const userDataRef = this.getUserDataRef();
      const cleanedConfig = this.cleanStateForFirebase(config);
      
      await updateDoc(userDataRef, {
        config: cleanedConfig,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  // Guardar historial de escaneos
  static async saveScanHistory(scanHistory: ScanHistory[]): Promise<void> {
    try {
      const userDataRef = this.getUserDataRef();
      const cleanedScanHistory = this.cleanStateForFirebase(scanHistory);
      
      await updateDoc(userDataRef, {
        scanHistory: cleanedScanHistory,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving scan history:', error);
      throw error;
    }
  }

  // Crear usuario en Firestore cuando se registra
  static async createUserProfile(email: string): Promise<void> {
    try {
      const userDocRef = this.getUserDocRef();
      await setDoc(userDocRef, {
        email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Actualizar último login
  static async updateLastLogin(): Promise<void> {
    try {
      const userDocRef = this.getUserDocRef();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Verificar si el documento existe
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        // Si existe, actualizar
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp()
        });
      } else {
        // Si no existe, crear el perfil
        await setDoc(userDocRef, {
          email: user.email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Verificar si el usuario tiene datos guardados
  static async hasUserData(): Promise<boolean> {
    try {
      const userDataRef = this.getUserDataRef();
      const docSnap = await getDoc(userDataRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking user data:', error);
      return false;
    }
  }

  // Migrar datos desde localStorage a Firestore
  static async migrateFromLocalStorage(localStorageData: AppState): Promise<void> {
    try {
      await this.saveAppState(localStorageData);
      console.log('Datos migrados exitosamente a Firestore');
    } catch (error) {
      console.error('Error migrating data:', error);
      throw error;
    }
  }
}

export default DatabaseService;