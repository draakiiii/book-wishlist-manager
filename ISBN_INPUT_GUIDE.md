# Guía de Uso del Sistema de Input ISBN

## Descripción
El sistema de input ISBN reemplaza el detector de códigos de barras con cámara por un input numérico simple y eficiente para buscar libros en la API de Google Books.

## Cómo usar el nuevo sistema

### 1. Acceder al formulario
- Ve a la sección "Agregar a Pila de Lectura"
- Haz clic en "Agregar nuevo libro a la pila"

### 2. Buscar por ISBN
- Haz clic en el botón "Buscar por ISBN"
- Se abrirá un modal con un campo de input

### 3. Ingresar el ISBN
- Escribe el número ISBN del libro (10 o 13 dígitos)
- El sistema validará automáticamente el formato
- Verás feedback visual:
  - ✅ Verde: ISBN válido
  - ❌ Rojo: ISBN inválido
  - 🔍 Azul: Buscando información

### 4. Buscar el libro
- Presiona "Buscar Libro" o Enter
- El sistema buscará en Google Books API
- Si encuentra el libro, se llenarán automáticamente:
  - Título
  - Autor
  - Número de páginas
  - Editorial (si está disponible)
  - Año de publicación (si está disponible)

### 5. Completar y guardar
- Revisa y ajusta la información si es necesario
- Agrega el nombre de la saga si corresponde
- Haz clic en "Agregar a Pila"

## Dónde encontrar el ISBN

### En libros físicos:
- **Contraportada**: Busca el código de barras y los números debajo
- **Página de derechos de autor**: Generalmente en las primeras páginas
- **Lomo del libro**: A veces aparece impreso

### Formatos soportados:
- **ISBN-10**: 10 dígitos (ej: 8445077528)
- **ISBN-13**: 13 dígitos (ej: 9788445077528)
- **Con guiones**: El sistema los elimina automáticamente

## Ventajas del nuevo sistema

### ✅ Beneficios:
- **Más rápido**: No hay que esperar a que la cámara se enfoque
- **Más confiable**: No depende de la calidad de la cámara o iluminación
- **Mejor compatibilidad**: Funciona en todos los navegadores
- **Sin permisos**: No requiere acceso a la cámara
- **Validación en tiempo real**: Sabes inmediatamente si el ISBN es válido

### 🔧 Características técnicas:
- Validación automática de ISBN-10 e ISBN-13
- Búsqueda múltiple en Google Books API
- Interfaz responsive para móviles
- Soporte para tema oscuro/claro
- Feedback visual inmediato

## Solución de problemas

### El ISBN no es válido:
- Verifica que tengas todos los dígitos
- Asegúrate de que sea un ISBN real (no un código de barras interno)
- Prueba con el ISBN-13 si tienes un ISBN-10

### No se encuentra el libro:
- Verifica que el ISBN sea correcto
- Algunos libros pueden no estar en Google Books
- Puedes agregar el libro manualmente

### Error de conexión:
- Verifica tu conexión a internet
- La API de Google Books puede estar temporalmente no disponible

## Próximas mejoras
- Sistema de cámara optimizado para móviles
- Soporte para otros formatos de códigos
- Historial de búsquedas recientes
- Sugerencias de libros similares