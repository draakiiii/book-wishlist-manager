import { BookData } from '../types';
import * as googleBooksAPI from './googleBooksAPI';
import * as openLibraryAPI from './openLibraryAPI';

// Default API providers
const DEFAULT_API_PROVIDER: 'google' | 'openlibrary' = 'openlibrary';
const DEFAULT_SCAN_API_PROVIDER: 'google' | 'openlibrary' = 'openlibrary';
const DEFAULT_SEARCH_API_PROVIDER: 'google' | 'openlibrary' = 'google';
const DEFAULT_COVER_API_PROVIDER: 'google' | 'openlibrary' = 'google';

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

// Get the scan API provider from configuration
const getScanApiProvider = (): 'google' | 'openlibrary' => {
  try {
    const config = localStorage.getItem('bibliotecaConfig');
    if (config) {
      const parsedConfig = JSON.parse(config);
      return parsedConfig.scanApiProvider || DEFAULT_SCAN_API_PROVIDER;
    }
  } catch (error) {
    console.warn('Error reading scan API provider from config:', error);
  }
  return DEFAULT_SCAN_API_PROVIDER;
};

// Get the search API provider from configuration
const getSearchApiProvider = (): 'google' | 'openlibrary' => {
  try {
    const config = localStorage.getItem('bibliotecaConfig');
    if (config) {
      const parsedConfig = JSON.parse(config);
      return parsedConfig.searchApiProvider || DEFAULT_SEARCH_API_PROVIDER;
    }
  } catch (error) {
    console.warn('Error reading search API provider from config:', error);
  }
  return DEFAULT_SEARCH_API_PROVIDER;
};

// Get the cover API provider from configuration
const getCoverApiProvider = (): 'google' | 'openlibrary' => {
  try {
    const config = localStorage.getItem('bibliotecaConfig');
    if (config) {
      const parsedConfig = JSON.parse(config);
      return parsedConfig.coverApiProvider || DEFAULT_COVER_API_PROVIDER;
    }
  } catch (error) {
    console.warn('Error reading cover API provider from config:', error);
  }
  return DEFAULT_COVER_API_PROVIDER;
};

// Unified fetchBookData function (for scanning)
export const fetchBookData = async (isbn: string): Promise<BookData | null> => {
  const provider = getScanApiProvider();
  console.log(`Using ${provider} API for ISBN scanning:`, isbn);
  
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
  const provider = getSearchApiProvider();
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
  const provider = getSearchApiProvider();
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

// Function to get book covers with fallback
export const getBookCovers = async (isbn: string): Promise<{
  smallThumbnail?: string;
  thumbnail?: string;
  largeThumbnail?: string;
}> => {
  const primaryProvider = getCoverApiProvider();
  const fallbackProvider = primaryProvider === 'google' ? 'openlibrary' : 'google';
  
  console.log(`Getting covers with ${primaryProvider} API, fallback to ${fallbackProvider}`);
  
  try {
    // Try primary API first
    let bookData: BookData | null = null;
    
    if (primaryProvider === 'google') {
      bookData = await googleBooksAPI.fetchBookData(isbn);
    } else {
      bookData = await openLibraryAPI.fetchBookData(isbn);
    }
    
    if (bookData && (bookData.smallThumbnail || bookData.thumbnail || bookData.largeThumbnail)) {
      console.log(`✅ Found covers with ${primaryProvider} API`);
      return {
        smallThumbnail: bookData.smallThumbnail,
        thumbnail: bookData.thumbnail,
        largeThumbnail: bookData.largeThumbnail
      };
    }
    
    // If no covers found, try fallback API
    console.log(`No covers found with ${primaryProvider}, trying ${fallbackProvider}`);
    
    if (fallbackProvider === 'google') {
      bookData = await googleBooksAPI.fetchBookData(isbn);
    } else {
      bookData = await openLibraryAPI.fetchBookData(isbn);
    }
    
    if (bookData && (bookData.smallThumbnail || bookData.thumbnail || bookData.largeThumbnail)) {
      console.log(`✅ Found covers with ${fallbackProvider} API`);
      return {
        smallThumbnail: bookData.smallThumbnail,
        thumbnail: bookData.thumbnail,
        largeThumbnail: bookData.largeThumbnail
      };
    }
    
    console.log('❌ No covers found with either API');
    return {};
    
  } catch (error) {
    console.error('Error getting book covers:', error);
    return {};
  }
};

// Function to enhance existing book data with better covers
export const enhanceBookWithCovers = async (book: BookData): Promise<BookData> => {
  if (!book.isbn) {
    return book;
  }
  
  // Check if book already has covers
  const hasCovers = book.smallThumbnail || book.thumbnail || book.largeThumbnail;
  
  if (hasCovers) {
    console.log('Book already has covers, skipping enhancement');
    return book;
  }
  
  console.log('Enhancing book with covers:', book.titulo);
  
  try {
    const covers = await getBookCovers(book.isbn);
    
    if (covers.smallThumbnail || covers.thumbnail || covers.largeThumbnail) {
      return {
        ...book,
        smallThumbnail: covers.smallThumbnail || book.smallThumbnail,
        thumbnail: covers.thumbnail || book.thumbnail,
        largeThumbnail: covers.largeThumbnail || book.largeThumbnail
      };
    }
  } catch (error) {
    console.error('Error enhancing book with covers:', error);
  }
  
  return book;
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
  const scanProvider = getScanApiProvider();
  const searchProvider = getSearchApiProvider();
  const coverProvider = getCoverApiProvider();
  
  return {
    scan: {
      provider: scanProvider,
      name: scanProvider === 'google' ? 'Google Books' : 'Open Library',
      baseUrl: scanProvider === 'google' ? 'https://www.googleapis.com/books/v1' : 'https://openlibrary.org'
    },
    search: {
      provider: searchProvider,
      name: searchProvider === 'google' ? 'Google Books' : 'Open Library',
      baseUrl: searchProvider === 'google' ? 'https://www.googleapis.com/books/v1' : 'https://openlibrary.org'
    },
    cover: {
      provider: coverProvider,
      name: coverProvider === 'google' ? 'Google Books' : 'Open Library',
      baseUrl: coverProvider === 'google' ? 'https://www.googleapis.com/books/v1' : 'https://openlibrary.org'
    }
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