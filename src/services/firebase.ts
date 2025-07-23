import { initializeApp } from 'firebase/app';
import { getAuth, Auth, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc, addDoc, orderBy, limit } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNVULfkfb77peQh7Y_LEguqNOiWSAHF5w",
  authDomain: "book-manager-1861b.firebaseapp.com",
  projectId: "book-manager-1861b",
  storageBucket: "book-manager-1861b.firebasestorage.app",
  messagingSenderId: "899173432766",
  appId: "1:899173432766:web:0ce14cfb20f0c2a2d94def",
  measurementId: "G-WQ0RP6111V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics not available:', error);
  }
}

export { analytics };

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

// Google Authentication
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogleRedirect = async (): Promise<void> => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    throw error;
  }
};

export const getGoogleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    throw error;
  }
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