import { BookData } from '../types';
import * as googleBooksAPI from './googleBooksAPI';
import * as openLibraryAPI from './openLibraryAPI';

// Default API provider
const DEFAULT_API_PROVIDER: 'google' | 'openlibrary' = 'openlibrary';

// Get the current API provider from configuration
const getApiProvider = (): 'google' | 'openlibrary' => {
  try {
    const config = localStorage.getItem('bibliotecaConfig');
    if (config) {
      const parsedConfig = JSON.parse(config);
      return parsedConfig.bookApiProvider || DEFAULT_API_PROVIDER;
    }
  } catch (error) {
    console.warn('Error reading API provider from config:', error);
  }
  return DEFAULT_API_PROVIDER;
};

// Unified fetchBookData function
export const fetchBookData = async (isbn: string): Promise<BookData | null> => {
  const provider = getApiProvider();
  console.log(`Using ${provider} API for ISBN lookup:`, isbn);
  
  try {
    if (provider === 'google') {
      return await googleBooksAPI.fetchBookData(isbn);
    } else {
      return await openLibraryAPI.fetchBookData(isbn);
    }
  } catch (error) {
    console.error(`Error with ${provider} API:`, error);
    
    // Fallback to the other API if the primary one fails
    const fallbackProvider = provider === 'google' ? 'openlibrary' : 'google';
    console.log(`Falling back to ${fallbackProvider} API`);
    
    try {
      if (fallbackProvider === 'google') {
        return await googleBooksAPI.fetchBookData(isbn);
      } else {
        return await openLibraryAPI.fetchBookData(isbn);
      }
    } catch (fallbackError) {
      console.error(`Fallback ${fallbackProvider} API also failed:`, fallbackError);
      throw new Error(`Error al buscar información del libro en ${provider} y ${fallbackProvider}`);
    }
  }
};

// Unified searchBooksByTitle function
export const searchBooksByTitle = async (query: string): Promise<BookData[]> => {
  const provider = getApiProvider();
  console.log(`Using ${provider} API for title search:`, query);
  
  try {
    if (provider === 'google') {
      return await googleBooksAPI.searchBooksByTitle(query);
    } else {
      return await openLibraryAPI.searchBooksByTitle(query);
    }
  } catch (error) {
    console.error(`Error with ${provider} API:`, error);
    
    // Fallback to the other API if the primary one fails
    const fallbackProvider = provider === 'google' ? 'openlibrary' : 'google';
    console.log(`Falling back to ${fallbackProvider} API`);
    
    try {
      if (fallbackProvider === 'google') {
        return await googleBooksAPI.searchBooksByTitle(query);
      } else {
        return await openLibraryAPI.searchBooksByTitle(query);
      }
    } catch (fallbackError) {
      console.error(`Fallback ${fallbackProvider} API also failed:`, fallbackError);
      return [];
    }
  }
};

// Unified searchBooksByAuthor function
export const searchBooksByAuthor = async (author: string): Promise<BookData[]> => {
  const provider = getApiProvider();
  console.log(`Using ${provider} API for author search:`, author);
  
  try {
    if (provider === 'google') {
      return await googleBooksAPI.searchBooksByAuthor(author);
    } else {
      return await openLibraryAPI.searchBooksByAuthor(author);
    }
  } catch (error) {
    console.error(`Error with ${provider} API:`, error);
    
    // Fallback to the other API if the primary one fails
    const fallbackProvider = provider === 'google' ? 'openlibrary' : 'google';
    console.log(`Falling back to ${fallbackProvider} API`);
    
    try {
      if (fallbackProvider === 'google') {
        return await googleBooksAPI.searchBooksByAuthor(author);
      } else {
        return await openLibraryAPI.searchBooksByAuthor(author);
      }
    } catch (fallbackError) {
      console.error(`Fallback ${fallbackProvider} API also failed:`, fallbackError);
      return [];
    }
  }
};

// Unified validateISBN function
export const validateISBN = (isbn: string): boolean => {
  // Both APIs use the same ISBN validation logic
  return googleBooksAPI.validateISBN(isbn);
};

// Unified convertISBN10To13 function
export const convertISBN10To13 = (isbn10: string): string => {
  // Both APIs use the same conversion logic
  return googleBooksAPI.convertISBN10To13(isbn10);
};

// Unified clearCache function
export const clearCache = () => {
  googleBooksAPI.clearCache();
  openLibraryAPI.clearCache();
  console.log('All API caches cleared');
};

// Unified getCacheStats function
export const getCacheStats = () => {
  const googleStats = googleBooksAPI.getCacheStats();
  const openLibraryStats = openLibraryAPI.getCacheStats();
  
  return {
    google: googleStats,
    openLibrary: openLibraryStats,
    total: {
      bookCacheSize: googleStats.bookCacheSize + openLibraryStats.bookCacheSize,
      searchCacheSize: googleStats.searchCacheSize + openLibraryStats.searchCacheSize,
      totalCachedItems: googleStats.totalCachedItems + openLibraryStats.totalCachedItems
    }
  };
};

// Function to get current API provider info
export const getCurrentApiProvider = () => {
  const provider = getApiProvider();
  return {
    provider,
    name: provider === 'google' ? 'Google Books' : 'Open Library',
    baseUrl: provider === 'google' ? 'https://www.googleapis.com/books/v1' : 'https://openlibrary.org'
  };
};

// Function to test API connectivity
export const testApiConnectivity = async (): Promise<{ google: boolean; openLibrary: boolean }> => {
  const results = {
    google: false,
    openLibrary: false
  };
  
  // Test Google Books API
  try {
    const testResponse = await fetch('https://www.googleapis.com/books/v1/volumes?q=test&maxResults=1', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    results.google = testResponse.ok;
  } catch (error) {
    console.warn('Google Books API test failed:', error);
  }
  
  // Test Open Library API
  try {
    const testResponse = await fetch('https://openlibrary.org/search.json?q=test&limit=1', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    results.openLibrary = testResponse.ok;
  } catch (error) {
    console.warn('Open Library API test failed:', error);
  }
  
  return results;
};

// Export individual API functions for direct access if needed
export { googleBooksAPI, openLibraryAPI };