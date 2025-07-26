# Guardián de Compras - Versión 7.1

Una aplicación avanzada para gestionar tu biblioteca personal, con sistema de recompensas, seguimiento de lectura y herramientas avanzadas de gestión.

## 🚀 Nuevas Características - Versión 7.1

### 🔍 Búsqueda de Google Images Integrada
- **Búsqueda de imágenes de Google** directamente desde la app
- **Modal de búsqueda avanzado** con pestañas para Google y subida local
- **Búsqueda específica de portadas** con título y autor del libro
- **Interfaz moderna** con grid de resultados y previews
- **Compresión automática** de imágenes seleccionadas
- **Validación de archivos** con límites de tamaño y formato
- **Configuración flexible** mediante variables de entorno

### 📁 Gestión de Imágenes Mejorada
- **Dos opciones de modificación**: Google Images o subida local
- **Compresión inteligente** de imágenes a 800px máximo
- **Validación de formatos** (JPG, PNG, GIF)
- **Límite de tamaño** de 5MB por archivo
- **Optimización automática** de calidad (80%)
- **Previsualización** de imágenes antes de aplicar

## 🚀 Características - Versión 7.0

### 🔍 Búsqueda y Filtros Avanzados
- **Búsqueda en tiempo real** con debounce para mejor rendimiento
- **Filtros múltiples**: por autor, saga, género, idioma, editorial, calificación, páginas, precio
- **Filtros por estado**: TBR, Historial, Wishlist, Actual
- **Historial de búsquedas** con las últimas 20 consultas
- **Búsqueda por ISBN, título, autor, editorial**
- **Resultados en tiempo real** con contadores por categoría

### 📊 Estadísticas Avanzadas
- **Dashboard completo** con métricas detalladas
- **Gráficos interactivos**: líneas, barras, áreas, circulares
- **Progreso mensual y anual** con visualizaciones
- **Análisis de géneros y autores** más leídos
- **Métricas de rendimiento** en tiempo real
- **Tiempo promedio de lectura** calculado automáticamente
- **Tasa de éxito de escaneos** y estadísticas de uso

### 💾 Exportación e Importación de Datos
- **Múltiples formatos**: JSON, CSV, Excel
- **Respaldo automático** con timestamps
- **Importación inteligente** que detecta formatos automáticamente
- **Migración de versiones** anteriores
- **Resumen de datos** antes de importar
- **Zona de peligro** para eliminación completa
- **Historial de respaldos** con fechas

### 📱 Escáner de Códigos de Barras Mejorado
- **Linterna integrada** para escaneo en condiciones de poca luz
- **Zoom digital** con controles precisos (1x - 5x)
- **Historial de escaneos** con estadísticas detalladas
- **Filtros por éxito/error** y búsqueda en historial
- **Tasa de éxito** y métricas de rendimiento
- **Interfaz mejorada** con controles táctiles
- **Detección automática** de capacidades de cámara

### ⚡ Mejoras en Performance
- **Virtualización de listas** para mejor rendimiento
- **Memoización inteligente** de componentes
- **Debounce en búsquedas** para reducir carga
- **Lazy loading** de componentes pesados
- **Métricas de rendimiento** en tiempo real
- **Optimización de re-renders** con React.memo
- **Gestión eficiente de memoria**

### 🎯 Gestión de Sagas Mejorada
- **Detección automática** de sagas por nombre
- **Contadores dinámicos** de libros por saga
- **Notificaciones inteligentes** de completado
- **Gestión de sagas huérfanas** automática
- **Estadísticas detalladas** por saga
- **Filtros por estado** de completado
- **Importación/exportación** de datos de sagas

### 📈 Historial de Escaneos
- **Registro completo** de todos los escaneos
- **Filtros avanzados** por éxito, fecha, ISBN
- **Búsqueda en historial** con resultados en tiempo real
- **Estadísticas detalladas** de uso
- **Exportación** del historial completo
- **Limpieza selectiva** de registros
- **Métricas de rendimiento** del escáner

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** con TypeScript
- **Framer Motion** para animaciones
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Recharts** para gráficos
- **React Window** para virtualización

### Escáner de Códigos
- **@zxing/library** para decodificación
- **MediaDevices API** para acceso a cámara
- **Torch API** para control de linterna
- **Zoom API** para zoom digital

### Gestión de Datos
- **File-Saver** para descarga de archivos
- **PapaParse** para parsing CSV
- **Date-fns** para manejo de fechas
- **LocalStorage** para persistencia

### Performance
- **React.memo** para optimización
- **useDebounce** para búsquedas
- **React Intersection Observer** para lazy loading
- **Performance API** para métricas

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd guardian-compras

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Construir para producción
npm run build
```

## 🎮 Uso

### Funciones Básicas
1. **Agregar libros** a tu TBR (To Be Read)
2. **Iniciar lectura** de un libro
3. **Marcar como completado** para ganar puntos
4. **Gestionar wishlist** para compras futuras
5. **Seguir sagas** automáticamente

### Funciones Avanzadas
1. **Búsqueda avanzada** con múltiples filtros
2. **Estadísticas detalladas** de tu lectura
3. **Exportar/importar** todos tus datos
4. **Escáner mejorado** con linterna y zoom
5. **Historial completo** de escaneos

## 🔧 Configuración

### Configuración de Google Images Search
Para habilitar la búsqueda de imágenes de Google, configura las variables de entorno:

1. **Copia el archivo de ejemplo**:
   ```bash
   cp .env.example .env
   ```

2. **Configura las credenciales** en el archivo `.env`:
   - `REACT_APP_GOOGLE_SEARCH_API_KEY`: Tu API Key de Google Cloud Console
   - `REACT_APP_GOOGLE_SEARCH_ENGINE_ID`: Tu Search Engine ID

3. **Consulta la guía completa** en `GOOGLE_IMAGES_SEARCH_SETUP.md`

### Configuración del Escáner
- **Preferencia de cámara**: Selecciona cámara frontal/trasera
- **Linterna**: Activa/desactiva según necesidad
- **Zoom**: Ajusta de 1x a 5x para mejor enfoque
- **Historial**: Guarda todos los escaneos automáticamente

### Configuración de Búsqueda
- **Debounce**: 300ms para búsquedas en tiempo real
- **Historial**: Últimas 20 búsquedas guardadas
- **Filtros**: Configurables por tipo de dato
- **Resultados**: Ordenables por múltiples criterios

### Configuración de Exportación
- **Formato por defecto**: JSON
- **Respaldo automático**: Cada 30 segundos
- **Compresión**: Opcional para archivos grandes
- **Validación**: Verificación de integridad

## 📊 Métricas de Performance

La aplicación incluye monitoreo en tiempo real de:
- **Tiempo de renderizado**: Promedio y actual
- **Uso de memoria**: Heap size y garbage collection
- **Tiempo de respuesta**: Interacciones del usuario
- **Carga de componentes**: Lazy loading metrics

## 🔒 Privacidad y Seguridad

- **Datos locales**: Todo se almacena en tu dispositivo
- **Sin tracking**: No se envían datos a servidores externos
- **Exportación segura**: Archivos locales únicamente
- **Permisos mínimos**: Solo cámara cuando se usa escáner

## 🐛 Solución de Problemas

### Escáner no funciona
1. Verifica permisos de cámara
2. Prueba cambiar de cámara
3. Activa linterna si hay poca luz
4. Ajusta zoom para mejor enfoque

### Búsqueda lenta
1. Usa filtros específicos
2. Reduce términos de búsqueda
3. Verifica que no haya demasiados libros
4. Reinicia la aplicación si es necesario

### Problemas de importación
1. Verifica formato del archivo
2. Asegúrate de que sea JSON o CSV válido
3. Revisa la versión de exportación
4. Haz respaldo antes de importar

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆕 Changelog

### v7.0.0
- ✨ Búsqueda y filtros avanzados
- 📊 Estadísticas avanzadas con gráficos
- 💾 Exportación/importación de datos
- 📱 Escáner mejorado con linterna y zoom
- ⚡ Optimizaciones de performance
- 🎯 Gestión de sagas mejorada
- 📈 Historial de escaneos completo

### v6.0.0
- 🎨 Sistema de temas mejorado
- 📱 Interfaz responsive
- 🔧 Configuración avanzada
- 📊 Progreso visual mejorado

## 📞 Soporte

Para reportar bugs o solicitar features, por favor abre un issue en GitHub.

---

**Guardián de Compras v7.0** - Tu compañero perfecto para gestionar tu biblioteca personal 🚀 