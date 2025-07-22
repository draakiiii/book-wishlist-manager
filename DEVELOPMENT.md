# Guía de Desarrollo - Guardián de Compras

## 🚀 Configuración del Entorno de Desarrollo

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn
- Git

### Instalación
```bash
git clone <repository-url>
cd guardian-compras
npm install
```

### Ejecutar en Desarrollo
```bash
npm start
```
La aplicación se abrirá automáticamente en `http://localhost:3000`

### Construir para Producción
```bash
npm run build
```

### Ejecutar Tests
```bash
npm test
```

## 🏗️ Arquitectura del Proyecto

### Estructura de Archivos
```
src/
├── components/          # Componentes de UI reutilizables
│   ├── BookCard.tsx     # Tarjeta individual de libro
│   ├── BookList.tsx     # Lista de libros
│   ├── ConfigForm.tsx   # Formulario de configuración
│   ├── ProgressBar.tsx  # Barra de progreso
│   ├── ScannerModal.tsx # Modal del escáner
│   ├── TBRForm.tsx      # Formulario para añadir libros
│   └── WishlistForm.tsx # Formulario de wishlist
├── context/             # Gestión de estado global
│   └── AppStateContext.tsx
├── services/            # Servicios externos
│   └── googleBooksAPI.ts
├── types/               # Definiciones de TypeScript
│   └── index.ts
├── App.tsx              # Componente principal
├── App.css              # Estilos
└── index.tsx            # Punto de entrada
```

### Gestión de Estado
La aplicación utiliza **React Context + useReducer** para la gestión del estado global:

- **AppStateContext**: Contexto principal que proporciona estado y dispatch
- **appReducer**: Función reductora que maneja todas las acciones
- **Actions**: Tipos de acciones definidos en `types/index.ts`

### Flujo de Datos
1. **Componente** → dispatch(action)
2. **Reducer** → procesa la acción y actualiza el estado
3. **Context** → notifica a los componentes suscritos
4. **Componente** → se re-renderiza con el nuevo estado

## 🎨 Sistema de Estilos

### Variables CSS
Los colores y temas se definen usando variables CSS en `src/App.css`:

```css
:root {
  --color-primario: #1A5276;
  --color-secundario: #5499C7;
  --color-acento: #F8C471;
  --color-wishlist: #A569BD;
  --color-exito: #48C9B0;
  --color-peligro: #EC7063;
  /* ... más variables */
}
```

### Modo Oscuro
El modo oscuro se activa cambiando la clase `dark-mode` en el `body`:

```css
body.dark-mode {
  --color-fondo: #1c2833;
  --color-tarjeta: #212f3d;
  --color-texto: #e5e8e8;
  /* ... más variables */
}
```

## 📱 Componentes Principales

### BookCard
- **Props**: `book: Libro`, `type: BookListType`
- **Funcionalidad**: Renderiza información del libro y botones de acción
- **Acciones**: Eliminar, mover, empezar, terminar, comprar

### ScannerModal
- **Props**: `isOpen: boolean`, `onClose: () => void`, `onScanSuccess: (bookData: BookData) => void`
- **Funcionalidad**: Escanea códigos de barras ISBN usando ZXing
- **Características**: Control de flash, selección de cámara, búsqueda automática

### ProgressBar
- **Funcionalidad**: Muestra progreso de puntos y estado de compra
- **Cálculos**: Porcentaje de progreso, estado desbloqueado/bloqueado

## 🔧 APIs y Servicios

### Google Books API
- **Endpoint**: `https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`
- **Función**: `fetchBookData(isbn: string): Promise<BookData | null>`
- **Datos**: Título, autor, número de páginas

### ZXing Library
- **Propósito**: Escaneo de códigos de barras
- **Clase**: `BrowserMultiFormatReader`
- **Características**: Soporte para múltiples formatos, control de cámara

## 📊 Tipos de Datos

### Libro
```typescript
interface Libro {
  id: number;
  titulo: string;
  autor?: string;
  paginas?: number;
  sagaId?: number;
  sagaName?: string;
}
```

### AppState
```typescript
interface AppState {
  config: Configuracion;
  progreso: number;
  compraDesbloqueada: boolean;
  libroActual: Libro | null;
  tbr: Libro[];
  historial: Libro[];
  wishlist: Libro[];
  sagas: Saga[];
  darkMode: boolean;
}
```

## 🧪 Testing

### Estructura de Tests
- **Jest**: Framework de testing
- **React Testing Library**: Utilidades para testing de componentes
- **Archivos**: `*.test.tsx` junto a los componentes

### Ejecutar Tests
```bash
npm test
```

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Servidor de Desarrollo
```bash
npm start
```

### Variables de Entorno
La aplicación no requiere variables de entorno adicionales ya que utiliza APIs públicas.

## 🔍 Debugging

### Herramientas de Desarrollo
- **React Developer Tools**: Para inspeccionar componentes y estado
- **Redux DevTools**: Compatible con React Context
- **Console**: Logs de errores y información

### Logs Importantes
- Errores de escaneo: `console.error('Error al buscar el libro:', error)`
- Estado de localStorage: `console.log('Estado cargado desde localStorage')`

## 📝 Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (ej: `BookCard`)
- **Funciones**: camelCase (ej: `handleSubmit`)
- **Tipos**: PascalCase (ej: `BookListType`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `STORAGE_KEY`)

### Estructura de Archivos
- **Componentes**: Un archivo por componente
- **Tipos**: Centralizados en `types/index.ts`
- **Servicios**: Un archivo por servicio
- **Estilos**: CSS modules o archivos CSS separados

### Comentarios
- **JSDoc**: Para funciones públicas
- **Comentarios inline**: Para lógica compleja
- **README**: Documentación de alto nivel

## 🐛 Problemas Comunes

### Errores de TypeScript
- **Solución**: Verificar tipos en `types/index.ts`
- **Causa común**: Imports incorrectos o tipos faltantes

### Errores de Escaneo
- **Solución**: Verificar permisos de cámara
- **Causa común**: HTTPS requerido para acceso a cámara

### Problemas de Estado
- **Solución**: Verificar acciones en el reducer
- **Causa común**: Payload incorrecto en dispatch

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Implementa los cambios
4. Añade tests si es necesario
5. Ejecuta `npm test` y `npm run build`
6. Abre un Pull Request

## 📞 Soporte

Para preguntas técnicas o problemas de desarrollo, abre un issue en el repositorio con la etiqueta `development`. 