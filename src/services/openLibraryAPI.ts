import { BookData } from '../types';

// Cache para evitar llamadas repetidas a la API
const bookCache = new Map<string, BookData>();
const searchCache = new Map<string, BookData[]>();

// Configuración de la API
const API_CONFIG = {
  baseUrl: 'https://openlibrary.org',
  booksEndpoint: '/api/books',
  searchEndpoint: '/search.json',
  authorsEndpoint: '/search/authors.json',
  coversBaseUrl: 'https://covers.openlibrary.org/b',
  timeout: 10000, // 10 segundos
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

// Función para obtener datos del autor
const fetchAuthorData = async (authorKey: string): Promise<string> => {
  try {
    const url = `${API_CONFIG.baseUrl}${authorKey}.json`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      return '';
    }
    
    const authorData = await response.json();
    return authorData.name || '';
  } catch (error) {
    console.warn('Error fetching author data:', error);
    return '';
  }
};

// Función para generar URLs de portadas
const generateCoverUrls = (coverId: number | string, isbn?: string) => {
  const urls = {
    smallThumbnail: '',
    thumbnail: ''
  };

  if (coverId) {
    urls.smallThumbnail = `${API_CONFIG.coversBaseUrl}/id/${coverId}-S.jpg`;
    urls.thumbnail = `${API_CONFIG.coversBaseUrl}/id/${coverId}-M.jpg`;
  } else if (isbn) {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    urls.smallThumbnail = `${API_CONFIG.coversBaseUrl}/isbn/${cleanIsbn}-S.jpg`;
    urls.thumbnail = `${API_CONFIG.coversBaseUrl}/isbn/${cleanIsbn}-M.jpg`;
  }

  return urls;
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
    
    // Use Open Library Books API
    const bibkeys = `ISBN:${cleanIsbn}`;
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.booksEndpoint}?bibkeys=${encodeURIComponent(bibkeys)}&format=json&jscmd=data`;
    
    console.log('Fetching from Open Library:', url);
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      console.warn('Open Library API request failed', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    const bookKey = `ISBN:${cleanIsbn}`;
    
    if (!data[bookKey]) {
      console.log('No book data found for ISBN:', cleanIsbn);
      return null;
    }
    
    const book = data[bookKey];
    
    // Extract basic information
    const title = book.title || '';
    
    // Extract authors
    let author = '';
    if (book.authors && book.authors.length > 0) {
      author = book.authors.map((a: any) => a.name).join(', ');
    }
    
    // Extract page count
    let pages: number | undefined;
    if (book.number_of_pages) {
      pages = book.number_of_pages;
    }
    
    // Extract publication date
    let publicationYear: number | undefined;
    if (book.publish_date) {
      const year = parseInt(book.publish_date);
      if (!isNaN(year)) {
        publicationYear = year;
      }
    }
    
    // Extract publisher
    const publisher = book.publishers && book.publishers.length > 0 ? book.publishers[0].name : '';
    
    // Extract description
    const description = book.description ? (typeof book.description === 'string' ? book.description : book.description.value) : '';
    
    // Extract subjects/categories
    const categories = book.subjects ? book.subjects.map((s: any) => s.name || s) : [];
    
    // Extract covers
    const coverUrls = generateCoverUrls(book.cover?.medium || book.cover?.large, cleanIsbn);
    
    const bookData: BookData = {
      titulo: title,
      autor: author || undefined,
      paginas: pages,
      isbn: cleanIsbn,
      publicacion: publicationYear,
      editorial: publisher || undefined,
      descripcion: description || undefined,
      categorias: categories.length > 0 ? categories : undefined,
      smallThumbnail: coverUrls.smallThumbnail || undefined,
      thumbnail: coverUrls.thumbnail || undefined,
    };
    
    // Cache the result
    (bookData as any).timestamp = Date.now();
    bookCache.set(cacheKey, bookData);
    
    console.log('Open Library book data found and cached:', bookData);
    return bookData;
    
  } catch (error) {
    console.error('Error al buscar el libro en Open Library:', error);
    throw new Error('Error al buscar información del libro en Open Library');
  }
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

    const url = `${API_CONFIG.baseUrl}${API_CONFIG.searchEndpoint}?author=${encodeURIComponent(author)}&limit=10`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn('Open Library API request failed for author search', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.docs || data.docs.length === 0) {
      return [];
    }

    const results = await Promise.all(data.docs.map(async (doc: any) => {
      // Extract basic information
      const title = doc.title || '';
      
      // Extract authors
      let authorName = '';
      if (doc.author_name && doc.author_name.length > 0) {
        authorName = doc.author_name.join(', ');
      }
      
      // Extract page count
      let pages: number | undefined;
      if (doc.number_of_pages_median) {
        pages = doc.number_of_pages_median;
      }
      
      // Extract publication year
      let publicationYear: number | undefined;
      if (doc.first_publish_year) {
        publicationYear = doc.first_publish_year;
      }
      
      // Extract publisher
      const publisher = doc.publisher && doc.publisher.length > 0 ? doc.publisher[0] : '';
      
      // Extract ISBN
      let isbn: string | undefined;
      if (doc.isbn && doc.isbn.length > 0) {
        isbn = doc.isbn[0];
      }
      
      // Extract subjects/categories
      const categories = doc.subject ? doc.subject.slice(0, 5) : [];
      
      // Extract language
      const language = doc.language && doc.language.length > 0 ? doc.language[0] : '';
      
      // Generate cover URLs
      const coverUrls = generateCoverUrls(doc.cover_i, isbn);
      
      return {
        titulo: title,
        autor: authorName || undefined,
        paginas: pages,
        isbn: isbn,
        publicacion: publicationYear,
        editorial: publisher || undefined,
        categorias: categories.length > 0 ? categories : undefined,
        idioma: language || undefined,
        smallThumbnail: coverUrls.smallThumbnail || undefined,
        thumbnail: coverUrls.thumbnail || undefined,
      };
    }));

    (results as any).timestamp = Date.now();
    searchCache.set(cacheKey, results);
    
    console.log(`Found ${results.length} books by author in Open Library: ${author}`);
    return results;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Author search request timeout for:', author);
    } else {
      console.error('Error searching books by author in Open Library:', error);
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

    const url = `${API_CONFIG.baseUrl}${API_CONFIG.searchEndpoint}?title=${encodeURIComponent(query)}&limit=10`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn('Open Library API request failed for title search', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.docs || data.docs.length === 0) {
      return [];
    }

    const results = data.docs.map((doc: any) => {
      // Extract basic information
      const title = doc.title || '';
      
      // Extract authors
      let author = '';
      if (doc.author_name && doc.author_name.length > 0) {
        author = doc.author_name.join(', ');
      }
      
      // Extract page count
      let pages: number | undefined;
      if (doc.number_of_pages_median) {
        pages = doc.number_of_pages_median;
      }
      
      // Extract publication year
      let publicationYear: number | undefined;
      if (doc.first_publish_year) {
        publicationYear = doc.first_publish_year;
      }
      
      // Extract publisher
      const publisher = doc.publisher && doc.publisher.length > 0 ? doc.publisher[0] : '';
      
      // Extract ISBN
      let isbn: string | undefined;
      if (doc.isbn && doc.isbn.length > 0) {
        isbn = doc.isbn[0];
      }
      
      // Extract subjects/categories
      const categories = doc.subject ? doc.subject.slice(0, 5) : [];
      
      // Extract language
      const language = doc.language && doc.language.length > 0 ? doc.language[0] : '';
      
      // Generate cover URLs
      const coverUrls = generateCoverUrls(doc.cover_i, isbn);
      
      return {
        titulo: title,
        autor: author || undefined,
        paginas: pages,
        isbn: isbn,
        publicacion: publicationYear,
        editorial: publisher || undefined,
        categorias: categories.length > 0 ? categories : undefined,
        idioma: language || undefined,
        smallThumbnail: coverUrls.smallThumbnail || undefined,
        thumbnail: coverUrls.thumbnail || undefined,
      };
    });

    // Cache the results
    (results as any).timestamp = Date.now();
    searchCache.set(cacheKey, results);
    
    console.log(`Found ${results.length} books for query in Open Library: ${query}`);
    return results;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Search request timeout for query:', query);
    } else {
      console.error('Error searching books by title in Open Library:', error);
    }
    return [];
  }
};

// Helper function to validate ISBN format (reutilizada de googleBooksAPI)
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

// Helper function to convert ISBN-10 to ISBN-13 (reutilizada de googleBooksAPI)
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

// Función para obtener portadas con múltiples formatos
export const getBookCovers = async (isbn?: string, olid?: string, coverId?: string) => {
  const covers = {
    small: '',
    medium: '',
    large: ''
  };

  try {
    if (coverId) {
      covers.small = `${API_CONFIG.coversBaseUrl}/id/${coverId}-S.jpg`;
      covers.medium = `${API_CONFIG.coversBaseUrl}/id/${coverId}-M.jpg`;
      covers.large = `${API_CONFIG.coversBaseUrl}/id/${coverId}-L.jpg`;
    } else if (isbn) {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      covers.small = `${API_CONFIG.coversBaseUrl}/isbn/${cleanIsbn}-S.jpg`;
      covers.medium = `${API_CONFIG.coversBaseUrl}/isbn/${cleanIsbn}-M.jpg`;
      covers.large = `${API_CONFIG.coversBaseUrl}/isbn/${cleanIsbn}-L.jpg`;
    } else if (olid) {
      covers.small = `${API_CONFIG.coversBaseUrl}/olid/${olid}-S.jpg`;
      covers.medium = `${API_CONFIG.coversBaseUrl}/olid/${olid}-M.jpg`;
      covers.large = `${API_CONFIG.coversBaseUrl}/olid/${olid}-L.jpg`;
    }

    return covers;
  } catch (error) {
    console.error('Error generating cover URLs:', error);
    return covers;
  }
};