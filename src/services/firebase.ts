import { initializeApp } from 'firebase/app';
import { getAuth, Auth, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc, addDoc, orderBy, limit } from 'firebase/firestore';

// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

// Authentication functions
export const signInUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signUpUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions for user data
export const saveUserData = async (userId: string, data: any): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
  } catch (error) {
    throw error;
  }
};

export const getUserData = async (userId: string): Promise<any> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

export const updateUserData = async (userId: string, data: any): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), data);
  } catch (error) {
    throw error;
  }
};

// Collection-specific functions
export const saveUserBooks = async (userId: string, books: any[]): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'books'), { books, updatedAt: Date.now() });
  } catch (error) {
    throw error;
  }
};

export const getUserBooks = async (userId: string): Promise<any[]> => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'books');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().books || [];
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
};

export const saveUserSagas = async (userId: string, sagas: any[]): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'sagas'), { sagas, updatedAt: Date.now() });
  } catch (error) {
    throw error;
  }
};

export const getUserSagas = async (userId: string): Promise<any[]> => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'sagas');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().sagas || [];
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
};

export const saveUserConfig = async (userId: string, config: any): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'config'), { config, updatedAt: Date.now() });
  } catch (error) {
    throw error;
  }
};

export const getUserConfig = async (userId: string): Promise<any> => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'config');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().config || {};
    } else {
      return {};
    }
  } catch (error) {
    throw error;
  }
};

export const saveUserHistory = async (userId: string, scanHistory: any[], searchHistory: string[]): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'history'), { 
      scanHistory, 
      searchHistory, 
      updatedAt: Date.now() 
    });
  } catch (error) {
    throw error;
  }
};

export const getUserHistory = async (userId: string): Promise<{ scanHistory: any[], searchHistory: string[] }> => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'history');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        scanHistory: data.scanHistory || [],
        searchHistory: data.searchHistory || []
      };
    } else {
      return { scanHistory: [], searchHistory: [] };
    }
  } catch (error) {
    throw error;
  }
};

export const saveUserPoints = async (userId: string, pointsData: any): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'points'), { 
      ...pointsData, 
      updatedAt: Date.now() 
    });
  } catch (error) {
    throw error;
  }
};

export const getUserPoints = async (userId: string): Promise<any> => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'points');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return {
        puntosActuales: 0,
        puntosGanados: 0,
        librosCompradosConPuntos: 0
      };
    }
  } catch (error) {
    throw error;
  }
};

// Backup and sync functions
export const createBackup = async (userId: string, backupData: any): Promise<void> => {
  try {
    await addDoc(collection(db, 'users', userId, 'backups'), {
      ...backupData,
      createdAt: Date.now()
    });
  } catch (error) {
    throw error;
  }
};

export const getBackups = async (userId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'users', userId, 'backups'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export default app;