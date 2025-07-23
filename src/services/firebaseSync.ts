import { 
  saveUserBooks, 
  getUserBooks, 
  saveUserSagas, 
  getUserSagas, 
  saveUserConfig, 
  getUserConfig, 
  saveUserHistory, 
  getUserHistory, 
  saveUserPoints, 
  getUserPoints,
  createBackup,
  getBackups
} from './firebase';
import { AppState, Libro, Saga, Configuracion, ScanHistory } from '../types';

export class FirebaseSyncService {
  private userId: string;
  private syncInProgress = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Save all user data to Firebase
  async saveAllData(state: AppState): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.syncInProgress = true;

    try {
      const promises = [
        saveUserBooks(this.userId, state.libros),
        saveUserSagas(this.userId, state.sagas),
        saveUserConfig(this.userId, state.config),
        saveUserHistory(this.userId, state.scanHistory, state.searchHistory),
        saveUserPoints(this.userId, {
          puntosActuales: state.puntosActuales,
          puntosGanados: state.puntosGanados,
          librosCompradosConPuntos: state.librosCompradosConPuntos
        })
      ];

      await Promise.all(promises);
      console.log('All data saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving data to Firebase:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Load all user data from Firebase
  async loadAllData(): Promise<Partial<AppState>> {
    try {
      const [books, sagas, config, history, points] = await Promise.all([
        getUserBooks(this.userId),
        getUserSagas(this.userId),
        getUserConfig(this.userId),
        getUserHistory(this.userId),
        getUserPoints(this.userId)
      ]);

      return {
        libros: books,
        sagas: sagas,
        config: config,
        scanHistory: history.scanHistory,
        searchHistory: history.searchHistory,
        puntosActuales: points.puntosActuales || 0,
        puntosGanados: points.puntosGanados || 0,
        librosCompradosConPuntos: points.librosCompradosConPuntos || 0
      };
    } catch (error) {
      console.error('Error loading data from Firebase:', error);
      throw error;
    }
  }

  // Save specific data types
  async saveBooks(books: Libro[]): Promise<void> {
    try {
      await saveUserBooks(this.userId, books);
    } catch (error) {
      console.error('Error saving books to Firebase:', error);
      throw error;
    }
  }

  async saveSagas(sagas: Saga[]): Promise<void> {
    try {
      await saveUserSagas(this.userId, sagas);
    } catch (error) {
      console.error('Error saving sagas to Firebase:', error);
      throw error;
    }
  }

  async saveConfig(config: Configuracion): Promise<void> {
    try {
      await saveUserConfig(this.userId, config);
    } catch (error) {
      console.error('Error saving config to Firebase:', error);
      throw error;
    }
  }

  async saveHistory(scanHistory: ScanHistory[], searchHistory: string[]): Promise<void> {
    try {
      await saveUserHistory(this.userId, scanHistory, searchHistory);
    } catch (error) {
      console.error('Error saving history to Firebase:', error);
      throw error;
    }
  }

  async savePoints(pointsData: { puntosActuales: number; puntosGanados: number; librosCompradosConPuntos: number }): Promise<void> {
    try {
      await saveUserPoints(this.userId, pointsData);
    } catch (error) {
      console.error('Error saving points to Firebase:', error);
      throw error;
    }
  }

  // Create a backup
  async createBackup(state: AppState): Promise<void> {
    try {
      const backupData = {
        version: '1.0',
        timestamp: Date.now(),
        config: state.config,
        libros: state.libros,
        sagas: state.sagas,
        scanHistory: state.scanHistory,
        searchHistory: state.searchHistory,
        puntosActuales: state.puntosActuales,
        puntosGanados: state.puntosGanados,
        librosCompradosConPuntos: state.librosCompradosConPuntos
      };

      await createBackup(this.userId, backupData);
      console.log('Backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // Get user backups
  async getBackups(): Promise<any[]> {
    try {
      return await getBackups(this.userId);
    } catch (error) {
      console.error('Error getting backups:', error);
      throw error;
    }
  }

  // Check if data exists in Firebase
  async hasData(): Promise<boolean> {
    try {
      const books = await getUserBooks(this.userId);
      return books.length > 0;
    } catch (error) {
      console.error('Error checking if data exists:', error);
      return false;
    }
  }

  // Migrate data from localStorage to Firebase
  async migrateFromLocalStorage(localState: AppState): Promise<void> {
    try {
      console.log('Starting migration from localStorage to Firebase...');
      await this.saveAllData(localState);
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }
}

// Create a singleton instance
let firebaseSyncInstance: FirebaseSyncService | null = null;

export const getFirebaseSyncService = (userId: string): FirebaseSyncService => {
  if (!firebaseSyncInstance) {
    firebaseSyncInstance = new FirebaseSyncService(userId);
  } else {
    // Create new instance if userId changes
    firebaseSyncInstance = new FirebaseSyncService(userId);
  }
  return firebaseSyncInstance;
};