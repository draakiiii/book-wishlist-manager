import { Libro } from '../types';

// Datos de ejemplo basados en el JSON proporcionado
export const sampleBookData: Libro = {
  id: 1,
  titulo: "El camino de los reyes (El Archivo de las Tormentas 1)",
  autor: "Brandon Sanderson",
  paginas: 1511,
  editorial: "NOVA",
  publicacion: 2015,
  descripcion: "Una épica historia de fantasía que sigue las vidas de varios personajes en un mundo donde las tormentas mágicas dan forma a la civilización...",
  idioma: "es",
  isbn: "9788490691779",
  categorias: ["Fiction"],
  calificacion: 5,
  numCalificaciones: 1,
  estado: "tbr",
  historialEstados: [],
  lecturas: [],
  formato: "fisico",
  
  // Campos para imágenes de portada (Google Books API)
  imageLinks: {
    smallThumbnail: "http://books.google.com/books/content?id=YhCYCgAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    thumbnail: "http://books.google.com/books/content?id=YhCYCgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
  },
  
  // Campos para acceso a vista previa (Google Books API)
  accessInfo: {
    viewability: "PARTIAL",
    webReaderLink: "http://play.google.com/books/reader?id=YhCYCgAAQBAJ&hl=&source=gbs_api"
  }
};

// Función para crear un libro de ejemplo con diferentes configuraciones
export const createSampleBook = (overrides: Partial<Libro> = {}): Libro => {
  return {
    ...sampleBookData,
    ...overrides
  };
};

// Ejemplos de libros con diferentes configuraciones
export const sampleBooks: Libro[] = [
  // Libro con vista previa disponible
  createSampleBook({
    id: 1,
    titulo: "El camino de los reyes",
    accessInfo: {
      viewability: "PARTIAL",
      webReaderLink: "http://play.google.com/books/reader?id=YhCYCgAAQBAJ&hl=&source=gbs_api"
    }
  }),
  
  // Libro sin vista previa disponible
  createSampleBook({
    id: 2,
    titulo: "Mistborn: El imperio final",
    accessInfo: {
      viewability: "NO_PAGES"
    }
  }),
  
  // Libro sin imágenes de portada
  createSampleBook({
    id: 3,
    titulo: "El nombre del viento",
    imageLinks: undefined
  }),
  
  // Libro con solo imagen pequeña
  createSampleBook({
    id: 4,
    titulo: "La rueda del tiempo",
    imageLinks: {
      smallThumbnail: "http://books.google.com/books/content?id=small_thumbnail_only&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api"
    }
  })
];