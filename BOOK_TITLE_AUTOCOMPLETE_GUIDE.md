# Guía de Autocompletado del Título del Libro

## Descripción

Se ha añadido una nueva funcionalidad de autocompletado para el título del libro que utiliza la API de Google Books para mostrar sugerencias mientras el usuario escribe. Esta funcionalidad está disponible tanto en el formulario de "Pila de Lectura" (TBR) como en el de "Lista de Deseos".

## Características

### 🔍 Búsqueda en Tiempo Real
- La búsqueda se activa automáticamente cuando el usuario escribe 2 o más caracteres
- Utiliza debouncing mejorado (500ms) que detecta cuando el usuario termina de escribir
- Cancelación automática de búsquedas anteriores para evitar resultados fuera de orden
- Muestra hasta 10 resultados ordenados por relevancia

### 📚 Información Detallada
Cada sugerencia muestra:
- **Título completo** (incluyendo subtítulo si está disponible)
- **Autor** del libro
- **Número de páginas** (si está disponible)
- **Año de publicación** (si está disponible)
- **Editorial** (si está disponible)
- **Calificación** con estrellas (si está disponible)

### 🎯 Autocompletado Inteligente
- Al seleccionar un libro del autocompletado, se rellenan automáticamente:
  - Título del libro
  - Autor
  - Número de páginas
- El formulario se expande automáticamente para mostrar la información
- Se muestra un mensaje de confirmación con detalles adicionales

## Componentes Añadidos

### `BookTitleAutocomplete.tsx`
Nuevo componente que maneja:
- Búsqueda en la API de Google Books
- Debouncing de las búsquedas
- Interfaz de usuario con animaciones
- Manejo de estados de carga y error

### Función `searchBooksByTitle()` en `googleBooksAPI.ts`
Nueva función que:
- Realiza búsquedas por título en Google Books
- Extrae y formatea toda la información relevante del libro
- Maneja errores de red y respuestas vacías

## Uso

### En Pila de Lectura (TBR)
1. Haz clic en "Agregar nuevo libro a la pila"
2. Comienza a escribir el título del libro en el campo "Título del Libro"
3. Aparecerán sugerencias automáticamente
4. Selecciona el libro deseado de la lista
5. Los campos se rellenarán automáticamente
6. Completa cualquier información adicional si es necesario
7. Haz clic en "Agregar a Pila"

### En Lista de Deseos
1. Haz clic en "Agregar nuevo libro a la lista de deseos"
2. Comienza a escribir el título del libro
3. Selecciona el libro de las sugerencias
4. Los campos se rellenarán automáticamente
5. Haz clic en "Agregar a Lista"

## Ventajas

### 🚀 Facilidad de Uso
- No es necesario recordar el título exacto del libro
- Evita errores de escritura
- Rellena automáticamente información adicional

### 📖 Información Completa
- Obtiene datos precisos de Google Books
- Incluye información como editorial y año de publicación
- Muestra calificaciones para ayudar en la decisión

### ⚡ Eficiencia
- Reduce el tiempo necesario para añadir libros
- Minimiza la entrada manual de datos
- Proporciona una experiencia de usuario fluida

## Limitaciones

- Requiere conexión a internet para funcionar
- Depende de la disponibilidad de la API de Google Books
- Los resultados están limitados a 10 sugerencias por búsqueda
- La búsqueda está optimizada para libros en español

## Compatibilidad

Esta funcionalidad es compatible con:
- ✅ Formulario de Pila de Lectura (TBR)
- ✅ Formulario de Lista de Deseos
- ✅ Modo oscuro y claro
- ✅ Dispositivos móviles y de escritorio
- ✅ Navegación por teclado (Enter, Escape)

## Notas Técnicas

- Utiliza la API pública de Google Books (no requiere API key)
- Implementa debouncing avanzado (500ms) que detecta cuando el usuario termina de escribir
- Cancelación automática de requests para evitar búsquedas fuera de orden
- Maneja estados de carga con indicadores visuales
- Incluye manejo de errores robusto
- Utiliza Framer Motion para animaciones suaves
- Previene búsquedas innecesarias cuando se selecciona un libro del autocompletado