# 🐛 Debugging: Configuración de APIs

## 🎯 Problema Reportado

El usuario está experimentando que el escaneo de ISBN con el código `849492320X` está usando Google Books en lugar de OpenLibrary, a pesar de que la configuración debería estar usando OpenLibrary para escaneo.

## 🔧 Configuración Esperada

Según la configuración definida, debería ser:
- **Escaneo de ISBN**: OpenLibrary (recomendado para escaneo)
- **Búsqueda por texto**: Google Books (recomendado para búsqueda)
- **Portadas**: Google Books con fallback (recomendado)

## 🛠️ Funciones de Debugging Añadidas

He añadido funciones de debugging que están disponibles en la consola del navegador:

### **1. Verificar Configuración Actual**
```javascript
BookAPIDebug.debugConfiguration()
```

Esto mostrará:
- Configuración actual activa
- Configuración por defecto
- Proveedor actual para cada función (scan, search, cover)

### **2. Forzar Configuración Recomendada**
```javascript
BookAPIDebug.forceRecommendedConfiguration()
```

Esto forzará la configuración recomendada:
- `scanApiProvider: 'open-library'`
- `searchApiProvider: 'google-books'` 
- `coverApiProvider: 'google-books'`

### **3. Verificar Proveedores Individuales**
```javascript
BookAPIDebug.getScanApiProvider()     // Debería devolver 'open-library'
BookAPIDebug.getSearchApiProvider()   // Debería devolver 'google-books'
BookAPIDebug.getCoverApiProvider()    // Debería devolver 'google-books'
```

## 📋 Pasos para Debugging

### **Paso 1: Verificar Configuración**
1. Abre la consola del navegador (F12)
2. Ejecuta: `BookAPIDebug.debugConfiguration()`
3. Revisa la salida - debería mostrar `scanProvider: 'open-library'`

### **Paso 2: Si está usando Google Books incorrectamente**
1. Ejecuta: `BookAPIDebug.forceRecommendedConfiguration()`
2. Intenta escanear el ISBN de nuevo
3. Verifica en los logs que ahora use OpenLibrary

### **Paso 3: Verificar Logs**
Durante el escaneo, deberías ver en la consola:
```
📚 Fetching book data for ISBN 849492320X using open-library
🔧 Current configuration: { scanProvider: 'open-library' }
✅ Using direct cover URLs from OpenLibrary API response
```

## 🔍 Posibles Causas del Problema

### **1. Configuración Guardada en Local Storage**
Es posible que tengas una configuración antigua guardada que esté sobrescribiendo la configuración por defecto.

**Solución:**
- Borrar el localStorage del navegador para esta app
- O usar `BookAPIDebug.forceRecommendedConfiguration()`

### **2. Timing de Carga de Configuración**
La configuración podría no estar cargada aún cuando se hace la primera llamada.

**Logs a buscar:**
```
⚙️ Configuration updated: { scanApiProvider: 'open-library' }
🔍 Getting scan API provider: { finalProvider: 'open-library' }
```

### **3. Cache de Configuración**
El servicio de API podría estar usando una configuración cacheada.

**Solución:**
- Recargar la página
- Usar `BookAPIDebug.forceRecommendedConfiguration()`

## 🧪 Test Específico para ISBN `849492320X`

1. Abre la consola
2. Ejecuta: `BookAPIDebug.debugConfiguration()`
3. Confirma que `scanProvider` es `'open-library'`
4. Escanea el ISBN `849492320X`
5. Verifica en los logs que use OpenLibrary:
   ```
   📚 Fetching book data for ISBN 849492320X using open-library
   Fetching from Open Library: https://openlibrary.org/api/books?bibkeys=ISBN:849492320X...
   ```

## 🎯 Logging Mejorado

Ahora todos los logs incluyen más información:
- **Configuración activa**: Qué configuración se está usando
- **Proveedor seleccionado**: Qué API se está llamando
- **URLs llamadas**: URLs exactas de las APIs
- **Respuestas**: Qué devuelve cada API

## ⚡ Solución Rápida

Si el problema persiste, ejecuta esto en la consola:

```javascript
// 1. Verificar estado
BookAPIDebug.debugConfiguration()

// 2. Forzar configuración correcta
BookAPIDebug.forceRecommendedConfiguration()

// 3. Confirmar cambio
BookAPIDebug.getScanApiProvider() // Debería devolver 'open-library'
```

Luego intenta escanear el ISBN de nuevo.

---

**Nota**: Estas funciones de debugging solo están disponibles en modo desarrollo y aparecerán en la consola cuando se cargue la aplicación.