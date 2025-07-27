import { BookData, Configuracion } from '../types';
import * as GoogleBooksAPI from './googleBooksAPI';
import * as OpenLibraryAPI from './openLibraryAPI';

// Tipo para proveedores de API
export type ApiProvider = 'google-books' | 'open-library';

// Configuración por defecto optimizada según el resumen del usuario
const DEFAULT_CONFIG = {
  scanApiProvider: 'open-library' as ApiProvider,
  searchApiProvider: 'google-books' as ApiProvider,
  coverApiProvider: 'google-books' as ApiProvider,
};

// Función para obtener la configuración actual (debería venir del contexto de la app)
let currentConfig: Configuracion = {};

export const setConfiguration = (config: Configuracion) => {
  currentConfig = config;
  console.log('⚙️ Configuration updated:', {
    scanApiProvider: config.scanApiProvider,
    searchApiProvider: config.searchApiProvider,
    coverApiProvider: config.coverApiProvider
  });
};

// Función para verificar y depurar la configuración actual
export const debugConfiguration = () => {
  console.log('🐛 DEBUG: Configuration Status', {
    currentConfig,
    defaultConfig: DEFAULT_CONFIG,
    scanProvider: getScanApiProvider(),
    searchProvider: getSearchApiProvider(),
    coverProvider: getCoverApiProvider()
  });
  
  return {
    currentConfig,
    defaultConfig: DEFAULT_CONFIG,
    scanProvider: getScanApiProvider(),
    searchProvider: getSearchApiProvider(),
    coverProvider: getCoverApiProvider()
  };
};

// Función para forzar la configuración recomendada
export const forceRecommendedConfiguration = () => {
  const recommendedConfig = {
    scanApiProvider: 'open-library' as ApiProvider,
    searchApiProvider: 'google-books' as ApiProvider,
    coverApiProvider: 'google-books' as ApiProvider
  };
  
  currentConfig = { ...currentConfig, ...recommendedConfig };
  console.log('🔧 Forced recommended configuration:', recommendedConfig);
  
  return currentConfig;
};

// Función para obtener el proveedor de API para escaneo
export const getScanApiProvider = (): ApiProvider => {
  const provider = currentConfig.scanApiProvider || DEFAULT_CONFIG.scanApiProvider;
  console.log('🔍 Getting scan API provider:', {
    fromCurrentConfig: currentConfig.scanApiProvider,
    fromDefaultConfig: DEFAULT_CONFIG.scanApiProvider,
    finalProvider: provider
  });
  return provider;
};

// Función para obtener el proveedor de API para búsqueda
export const getSearchApiProvider = (): ApiProvider => {
  return currentConfig.searchApiProvider || DEFAULT_CONFIG.searchApiProvider;
};

// Función para obtener el proveedor de API para portadas
export const getCoverApiProvider = (): ApiProvider => {
  return currentConfig.coverApiProvider || DEFAULT_CONFIG.coverApiProvider;
};

// Función principal para buscar datos de libro por ISBN (escaneo)
export const fetchBookData = async (isbn: string): Promise<BookData | null> => {
  const provider = getScanApiProvider();
  
  console.log(`📚 Fetching book data for ISBN ${isbn} using ${provider}`);
  console.log('🔧 Current configuration:', {
    currentConfig,
    defaultConfig: DEFAULT_CONFIG,
    scanProvider: provider
  });
  
  try {
    if (provider === 'open-library') {
      return await OpenLibraryAPI.fetchBookData(isbn);
    } else {
      return await GoogleBooksAPI.fetchBookData(isbn);
    }
  } catch (error) {
    console.error(`Error with primary API provider ${provider}:`, error);
    
    // Fallback: intentar con el otro proveedor
    const fallbackProvider = provider === 'open-library' ? 'google-books' : 'open-library';
    console.log(`🔄 Attempting fallback with ${fallbackProvider}`);
    
    try {
      if (fallbackProvider === 'open-library') {
        return await OpenLibraryAPI.fetchBookData(isbn);
      } else {
        return await GoogleBooksAPI.fetchBookData(isbn);
      }
    } catch (fallbackError) {
      console.error(`Fallback API provider ${fallbackProvider} also failed:`, fallbackError);
      throw new Error(`Error al buscar información del libro: ambas APIs fallaron`);
    }
  }
};

// Función para buscar libros por título (búsqueda de texto)
export const searchBooksByTitle = async (query: string): Promise<BookData[]> => {
  const provider = getSearchApiProvider();
  
  console.log(`🔍 Searching books by title "${query}" using ${provider}`);
  
  try {
    if (provider === 'open-library') {
      return await OpenLibraryAPI.searchBooksByTitle(query);
    } else {
      return await GoogleBooksAPI.searchBooksByTitle(query);
    }
  } catch (error) {
    console.error(`Error with primary search provider ${provider}:`, error);
    
    // Fallback: intentar con el otro proveedor
    const fallbackProvider = provider === 'open-library' ? 'google-books' : 'open-library';
    console.log(`🔄 Attempting search fallback with ${fallbackProvider}`);
    
    try {
      if (fallbackProvider === 'open-library') {
        return await OpenLibraryAPI.searchBooksByTitle(query);
      } else {
        return await GoogleBooksAPI.searchBooksByTitle(query);
      }
    } catch (fallbackError) {
      console.error(`Fallback search provider ${fallbackProvider} also failed:`, fallbackError);
      return []; // Retornar array vacío en lugar de error para búsquedas
    }
  }
};

// Función para buscar libros por autor
export const searchBooksByAuthor = async (author: string): Promise<BookData[]> => {
  const provider = getSearchApiProvider();
  
  console.log(`👤 Searching books by author "${author}" using ${provider}`);
  
  try {
    if (provider === 'open-library') {
      return await OpenLibraryAPI.searchBooksByAuthor(author);
    } else {
      return await GoogleBooksAPI.searchBooksByAuthor(author);
    }
  } catch (error) {
    console.error(`Error with primary author search provider ${provider}:`, error);
    
    // Fallback: intentar con el otro proveedor
    const fallbackProvider = provider === 'open-library' ? 'google-books' : 'open-library';
    console.log(`🔄 Attempting author search fallback with ${fallbackProvider}`);
    
    try {
      if (fallbackProvider === 'open-library') {
        return await OpenLibraryAPI.searchBooksByAuthor(author);
      } else {
        return await GoogleBooksAPI.searchBooksByAuthor(author);
      }
    } catch (fallbackError) {
      console.error(`Fallback author search provider ${fallbackProvider} also failed:`, fallbackError);
      return []; // Retornar array vacío en lugar de error para búsquedas
    }
  }
};

// Sistema de fallback inteligente para portadas
export const getBookCovers = async (bookData: {
  isbn?: string;
  smallThumbnail?: string;
  thumbnail?: string;
  olid?: string;
  coverId?: string;
}) => {
  const provider = getCoverApiProvider();
  const covers = {
    small: '',
    medium: '',
    large: '',
    smallThumbnail: '',
    thumbnail: ''
  };

  console.log(`🖼️ Getting book covers using ${provider} provider`);

  try {
    // 1. Intentar con las URLs existentes del libro si las hay
    if (bookData.smallThumbnail || bookData.thumbnail) {
      covers.smallThumbnail = bookData.smallThumbnail || '';
      covers.thumbnail = bookData.thumbnail || '';
      covers.small = bookData.smallThumbnail || '';
      covers.medium = bookData.thumbnail || '';
      console.log('✅ Using existing cover URLs from book data');
      return covers;
    }

    // 2. Intentar con el proveedor principal
    if (provider === 'google-books' && bookData.isbn) {
      // Para Google Books, intentar obtener datos frescos que pueden incluir portadas
      const freshData = await GoogleBooksAPI.fetchBookData(bookData.isbn);
      if (freshData?.smallThumbnail || freshData?.thumbnail) {
        covers.smallThumbnail = freshData.smallThumbnail || '';
        covers.thumbnail = freshData.thumbnail || '';
        covers.small = freshData.smallThumbnail || '';
        covers.medium = freshData.thumbnail || '';
        console.log('✅ Got covers from Google Books');
        return covers;
      }
    } else if (provider === 'open-library') {
      // Para Open Library, usar el servicio de portadas
      const olCovers = await OpenLibraryAPI.getBookCovers(
        bookData.isbn,
        bookData.olid,
        bookData.coverId
      );
      if (olCovers.small || olCovers.medium) {
        covers.small = olCovers.small;
        covers.medium = olCovers.medium;
        covers.large = olCovers.large;
        covers.smallThumbnail = olCovers.small;
        covers.thumbnail = olCovers.medium;
        console.log('✅ Got covers from Open Library');
        return covers;
      }
    }

    // 3. Fallback: intentar con el otro proveedor
    const fallbackProvider = provider === 'open-library' ? 'google-books' : 'open-library';
    console.log(`🔄 Attempting cover fallback with ${fallbackProvider}`);

    if (fallbackProvider === 'google-books' && bookData.isbn) {
      const freshData = await GoogleBooksAPI.fetchBookData(bookData.isbn);
      if (freshData?.smallThumbnail || freshData?.thumbnail) {
        covers.smallThumbnail = freshData.smallThumbnail || '';
        covers.thumbnail = freshData.thumbnail || '';
        covers.small = freshData.smallThumbnail || '';
        covers.medium = freshData.thumbnail || '';
        console.log('✅ Got covers from Google Books fallback');
        return covers;
      }
    } else if (fallbackProvider === 'open-library') {
      const olCovers = await OpenLibraryAPI.getBookCovers(
        bookData.isbn,
        bookData.olid,
        bookData.coverId
      );
      if (olCovers.small || olCovers.medium) {
        covers.small = olCovers.small;
        covers.medium = olCovers.medium;
        covers.large = olCovers.large;
        covers.smallThumbnail = olCovers.small;
        covers.thumbnail = olCovers.medium;
        console.log('✅ Got covers from Open Library fallback');
        return covers;
      }
    }

    // 4. Último recurso: generar URLs basadas en ISBN
    if (bookData.isbn) {
      const cleanIsbn = bookData.isbn.replace(/[^0-9X]/gi, '');
      covers.small = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-S.jpg`;
      covers.medium = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;
      covers.large = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
      covers.smallThumbnail = covers.small;
      covers.thumbnail = covers.medium;
      console.log('📖 Using ISBN-based cover URLs as last resort');
    }

    return covers;
  } catch (error) {
    console.error('Error getting book covers:', error);
    return covers;
  }
};

// Función para mejorar libros existentes con portadas
export const enhanceBookWithCovers = async (bookData: BookData): Promise<BookData> => {
  try {
    const covers = await getBookCovers(bookData);
    
    return {
      ...bookData,
      smallThumbnail: covers.smallThumbnail || bookData.smallThumbnail,
      thumbnail: covers.thumbnail || bookData.thumbnail,
    };
  } catch (error) {
    console.error('Error enhancing book with covers:', error);
    return bookData;
  }
};

// Funciones de utilidad reutilizadas
export const validateISBN = (isbn: string): boolean => {
  return GoogleBooksAPI.validateISBN(isbn); // Ambas APIs usan la misma validación
};

export const convertISBN10To13 = (isbn10: string): string => {
  return GoogleBooksAPI.convertISBN10To13(isbn10); // Ambas APIs usan la misma conversión
};

// Función para limpiar caché de todas las APIs
export const clearAllCaches = () => {
  GoogleBooksAPI.clearCache();
  OpenLibraryAPI.clearCache();
  console.log('All API caches cleared');
};

// Función para obtener estadísticas del caché de todas las APIs
export const getAllCacheStats = () => {
  const googleStats = GoogleBooksAPI.getCacheStats();
  const openLibraryStats = OpenLibraryAPI.getCacheStats();
  
  return {
    googleBooks: googleStats,
    openLibrary: openLibraryStats,
    totalCachedItems: googleStats.totalCachedItems + openLibraryStats.totalCachedItems
  };
};

// Exportar funciones específicas de cada API para uso directo si es necesario
export const GoogleBooks = GoogleBooksAPI;
export const OpenLibrary = OpenLibraryAPI;

// Exportar funciones de debugging para desarrollo
export const Debug = {
  debugConfiguration,
  forceRecommendedConfiguration,
  getScanApiProvider,
  getSearchApiProvider,
  getCoverApiProvider
};

// Hacer las funciones de debug disponibles globalmente en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).BookAPIDebug = Debug;
  console.log('🚀 BookAPIDebug functions available in console:', Object.keys(Debug));
}