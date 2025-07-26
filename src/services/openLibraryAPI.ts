import { BookData } from '../types';

// Cache para evitar llamadas repetidas a la API
const bookCache = new Map<string, BookData>();
const searchCache = new Map<string, BookData[]>();

// Configuración de la API de Open Library
const API_CONFIG = {
  baseUrl: 'https://openlibrary.org',
  timeout: 10000, // 10 segundos
  maxResults: 10,
};

// Función para limpiar el caché periódicamente
const cleanupCache = () => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutos
  
  for (const [key, value] of bookCache.entries()) {
    if (now - (value as any).timestamp > maxAge) {
      bookCache.delete(key);
    }
  }
  
  for (const [key, value] of searchCache.entries()) {
    if (now - (value as any).timestamp > maxAge) {
      searchCache.delete(key);
    }
  }
};

// Limpiar caché cada 5 minutos
setInterval(cleanupCache, 5 * 60 * 1000);

// Función para hacer peticiones con timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout: number = API_CONFIG.timeout): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Función para extraer información del libro desde la respuesta de Open Library
const extractBookData = (data: any, isbn?: string): BookData | null => {
  try {
    // Extraer título
    let title = data.title || '';
    if (data.subtitle) {
      title += `: ${data.subtitle}`;
    }
    
    // Extraer autores
    let author = '';
    if (data.authors && data.authors.length > 0) {
      author = data.authors.map((author: any) => author.name || author).join(', ');
    }
    
    // Extraer número de páginas
    let pages: number | undefined;
    if (data.number_of_pages_median) {
      pages = data.number_of_pages_median;
    } else if (data.number_of_pages) {
      pages = data.number_of_pages;
    }
    
    // Extraer año de publicación
    let publicationYear: number | undefined;
    if (data.first_publish_year) {
      publicationYear = data.first_publish_year;
    } else if (data.publish_date) {
      const year = parseInt(data.publish_date.substring(0, 4));
      if (!isNaN(year)) {
        publicationYear = year;
      }
    }
    
    // Extraer editorial
    const publisher = data.publishers?.[0]?.name || data.publisher || '';
    
    // Extraer descripción
    const description = data.description?.value || data.description || '';
    
    // Extraer categorías/subjectos
    const categories = data.subjects?.map((subject: any) => subject.name || subject) || [];
    
    // Extraer idioma
    const language = data.languages?.[0]?.key?.replace('languages/', '') || '';
    
    // Extraer ISBN si no se proporcionó
    let bookIsbn = isbn;
    if (!bookIsbn && data.isbn_13) {
      bookIsbn = data.isbn_13[0];
    } else if (!bookIsbn && data.isbn_10) {
      bookIsbn = data.isbn_10[0];
    }
    
    // Construir URLs de portadas
    let smallThumbnail: string | undefined;
    let thumbnail: string | undefined;
    if (data.cover_i) {
      smallThumbnail = `${API_CONFIG.baseUrl}/covers/i/${data.cover_i}-S.jpg`;
      thumbnail = `${API_CONFIG.baseUrl}/covers/i/${data.cover_i}-M.jpg`;
    } else if (bookIsbn) {
      smallThumbnail = `${API_CONFIG.baseUrl}/covers/isbn/${bookIsbn}-S.jpg`;
      thumbnail = `${API_CONFIG.baseUrl}/covers/isbn/${bookIsbn}-M.jpg`;
    }
    
    return {
      titulo: title,
      autor: author || undefined,
      paginas: pages,
      isbn: bookIsbn,
      publicacion: publicationYear,
      editorial: publisher || undefined,
      descripcion: description || undefined,
      categorias: categories.length > 0 ? categories : undefined,
      idioma: language || undefined,
      smallThumbnail,
      thumbnail,
      // Open Library no proporciona viewability ni webReaderLink
    };
  } catch (error) {
    console.error('Error extracting book data:', error);
    return null;
  }
};

export const fetchBookData = async (isbn: string): Promise<BookData | null> => {
  try {
    // Clean the ISBN (remove any non-numeric characters except 'X')
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    
    // Check cache first
    const cacheKey = `isbn_${cleanIsbn}`;
    if (bookCache.has(cacheKey)) {
      const cachedData = bookCache.get(cacheKey);
      console.log('Using cached book data for ISBN:', cleanIsbn);
      return cachedData || null;
    }
    
    // Try multiple search strategies
    const searchQueries = [
      cleanIsbn,
      cleanIsbn.replace(/^978/, ''), // Try without 978 prefix
      `978${cleanIsbn}` // Try with 978 prefix
    ];

    let bookData: BookData | null = null;

    for (const query of searchQueries) {
      try {
        // First try direct ISBN lookup
        const isbnUrl = `${API_CONFIG.baseUrl}/isbn/${query}.json`;
        const isbnResponse = await fetchWithTimeout(isbnUrl);
        
        if (isbnResponse.ok) {
          const isbnData = await isbnResponse.json();
          bookData = extractBookData(isbnData, query);
          if (bookData) {
            console.log('Book found via direct ISBN lookup:', bookData);
            break;
          }
        }
        
        // If direct lookup fails, try search API
        const searchUrl = `${API_CONFIG.baseUrl}/search.json?q=isbn:${query}`;
        const searchResponse = await fetchWithTimeout(searchUrl);
        
        if (!searchResponse.ok) {
          console.warn(`API request failed for query: ${query}`, searchResponse.status, searchResponse.statusText);
          continue;
        }
        
        const searchData = await searchResponse.json();
        
        if (searchData.numFound > 0 && searchData.docs.length > 0) {
          const book = searchData.docs[0];
          bookData = extractBookData(book, query);
          
          if (bookData) {
            console.log('Book found via search API:', bookData);
            break;
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`Request timeout for query: ${query}`);
        } else {
          console.warn(`Error searching with query "${query}":`, error);
        }
        continue;
      }
    }
    
    if (!bookData) {
      console.log('No book data found for ISBN:', cleanIsbn);
      return null;
    }
    
    // Cache the result
    (bookData as any).timestamp = Date.now();
    bookCache.set(cacheKey, bookData);
    
    console.log('Book data found and cached:', bookData);
    return bookData;
  } catch (error) {
    console.error('Error al buscar el libro:', error);
    throw new Error('Error al buscar información del libro en Open Library');
  }
};

// Helper function to validate ISBN format
export const validateISBN = (isbn: string): boolean => {
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
  
  if (cleanIsbn.length === 10) {
    // ISBN-10 validation
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanIsbn[i]) * (10 - i);
    }
    const lastChar = cleanIsbn[9].toUpperCase();
    const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar);
    sum += checkDigit;
    return sum % 11 === 0;
  } else if (cleanIsbn.length === 13) {
    // ISBN-13 validation
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanIsbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = parseInt(cleanIsbn[12]);
    const calculatedCheck = (10 - (sum % 10)) % 10;
    return checkDigit === calculatedCheck;
  }
  
  return false;
};

// Helper function to convert ISBN-10 to ISBN-13
export const convertISBN10To13 = (isbn10: string): string => {
  const cleanIsbn = isbn10.replace(/[^0-9X]/gi, '');
  if (cleanIsbn.length !== 10) return isbn10;
  
  // Convert to ISBN-13 by adding 978 prefix
  const isbn13 = '978' + cleanIsbn.substring(0, 9);
  
  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn13[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return isbn13 + checkDigit;
};

// Función para buscar libros por autor
export const searchBooksByAuthor = async (author: string): Promise<BookData[]> => {
  try {
    if (!author.trim() || author.length < 2) {
      return [];
    }

    const cacheKey = `author_${author.toLowerCase().trim()}`;
    
    if (searchCache.has(cacheKey)) {
      const cachedData = searchCache.get(cacheKey);
      console.log('Using cached author search results for:', author);
      return cachedData || [];
    }

    const url = `${API_CONFIG.baseUrl}/search.json?author=${encodeURIComponent(author.trim())}&limit=${API_CONFIG.maxResults}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn('API request failed for author search', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (data.numFound === 0) {
      return [];
    }

    const results = data.docs.map((doc: any) => extractBookData(doc)).filter(Boolean);

    (results as any).timestamp = Date.now();
    searchCache.set(cacheKey, results);
    
    console.log(`Found ${results.length} books by author: ${author}`);
    return results;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Author search request timeout for:', author);
    } else {
      console.error('Error searching books by author:', error);
    }
    return [];
  }
};

// Función para buscar libros por título
export const searchBooksByTitle = async (query: string): Promise<BookData[]> => {
  try {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    // Check cache first
    const cacheKey = `search_${query.toLowerCase().trim()}`;
    if (searchCache.has(cacheKey)) {
      const cachedData = searchCache.get(cacheKey);
      console.log('Using cached search results for query:', query);
      return cachedData || [];
    }

    const url = `${API_CONFIG.baseUrl}/search.json?q=${encodeURIComponent(query.trim())}&limit=${API_CONFIG.maxResults}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn('API request failed for title search', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (data.numFound === 0) {
      return [];
    }

    const results = data.docs.map((doc: any) => extractBookData(doc)).filter(Boolean);

    // Cache the results
    (results as any).timestamp = Date.now();
    searchCache.set(cacheKey, results);
    
    console.log(`Found ${results.length} books for query: ${query}`);
    return results;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Search request timeout for query:', query);
    } else {
      console.error('Error searching books by title:', error);
    }
    return [];
  }
};

// Función para obtener detalles de un libro por OLID
export const fetchBookByOLID = async (olid: string): Promise<BookData | null> => {
  try {
    const cacheKey = `olid_${olid}`;
    if (bookCache.has(cacheKey)) {
      const cachedData = bookCache.get(cacheKey);
      console.log('Using cached book data for OLID:', olid);
      return cachedData || null;
    }

    const url = `${API_CONFIG.baseUrl}/books/${olid}.json`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn('API request failed for OLID lookup', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const bookData = extractBookData(data);

    if (bookData) {
      (bookData as any).timestamp = Date.now();
      bookCache.set(cacheKey, bookData);
    }

    return bookData;
  } catch (error) {
    console.error('Error fetching book by OLID:', error);
    return null;
  }
};

// Función para obtener libros por tema/subjecto
export const fetchBooksBySubject = async (subject: string): Promise<BookData[]> => {
  try {
    if (!subject.trim()) {
      return [];
    }

    const cacheKey = `subject_${subject.toLowerCase().trim()}`;
    if (searchCache.has(cacheKey)) {
      const cachedData = searchCache.get(cacheKey);
      console.log('Using cached subject search results for:', subject);
      return cachedData || [];
    }

    const url = `${API_CONFIG.baseUrl}/subjects/${encodeURIComponent(subject.trim())}.json?limit=${API_CONFIG.maxResults}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn('API request failed for subject search', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.works || data.works.length === 0) {
      return [];
    }

    const results = data.works.map((work: any) => extractBookData(work)).filter(Boolean);

    (results as any).timestamp = Date.now();
    searchCache.set(cacheKey, results);
    
    console.log(`Found ${results.length} books for subject: ${subject}`);
    return results;
  } catch (error) {
    console.error('Error searching books by subject:', error);
    return [];
  }
};

// Función para limpiar el caché manualmente
export const clearCache = () => {
  bookCache.clear();
  searchCache.clear();
  console.log('Open Library API cache cleared');
};

// Función para obtener estadísticas del caché
export const getCacheStats = () => {
  return {
    bookCacheSize: bookCache.size,
    searchCacheSize: searchCache.size,
    totalCachedItems: bookCache.size + searchCache.size
  };
};