import { BookData } from '../types';

export const fetchBookData = async (isbn: string): Promise<BookData | null> => {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    
    if (!response.ok) {
      throw new Error('La respuesta de la red no fue correcta.');
    }
    
    const data = await response.json();
    
    if (data.totalItems > 0) {
      const book = data.items[0].volumeInfo;
      return {
        titulo: book.title || '',
        autor: book.authors ? book.authors.join(', ') : undefined,
        paginas: book.pageCount || undefined
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error al buscar el libro:', error);
    throw error;
  }
}; 