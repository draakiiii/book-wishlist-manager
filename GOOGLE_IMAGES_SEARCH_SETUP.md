# Configuración de Búsqueda de Google Images

Esta guía explica cómo configurar la API de Google Custom Search para habilitar la búsqueda de imágenes de Google directamente en la aplicación.

## Características

- 🔍 Búsqueda de imágenes de Google integrada en la app
- 📁 Subida de archivos locales como alternativa
- 🎯 Búsqueda específica de portadas de libros
- 📱 Interfaz moderna y responsive
- ⚡ Compresión automática de imágenes

## Configuración de la API

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Custom Search:
   - Ve a "APIs & Services" > "Library"
   - Busca "Custom Search API"
   - Haz clic en "Enable"

### 2. Crear credenciales de API

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "API Key"
3. Copia la clave de API generada
4. (Opcional) Restringe la clave a la API de Custom Search para mayor seguridad

### 3. Crear un Custom Search Engine

1. Ve a [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Haz clic en "Create a search engine"
3. Configura el motor de búsqueda:
   - **Sites to search**: Deja vacío para buscar en toda la web
   - **Name**: Un nombre descriptivo (ej: "Book Covers Search")
   - **Language**: Español (o el idioma preferido)
4. Haz clic en "Create"
5. Ve a "Customize" > "Search engine ID"
6. Copia el Search Engine ID

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
REACT_APP_GOOGLE_SEARCH_API_KEY=tu_api_key_aqui
REACT_APP_GOOGLE_SEARCH_ENGINE_ID=tu_search_engine_id_aqui
```

### 5. Reiniciar la aplicación

Después de configurar las variables de entorno, reinicia la aplicación:

```bash
npm start
```

## Uso de la funcionalidad

### Búsqueda en Google Images

1. Haz clic derecho en cualquier portada de libro
2. Selecciona "Buscar en Google"
3. El modal se abrirá con una búsqueda predefinida del título del libro
4. Modifica la búsqueda si es necesario
5. Haz clic en "Buscar"
6. Selecciona la imagen deseada de los resultados

### Subida de archivo local

1. En el modal de búsqueda, cambia a la pestaña "Subir archivo"
2. Haz clic en el área de subida o arrastra un archivo
3. La imagen se comprimirá automáticamente
4. Se aplicará como nueva portada del libro

## Limitaciones y consideraciones

### Límites de la API de Google

- **Cuota gratuita**: 100 búsquedas por día
- **Resultados por búsqueda**: Máximo 10 imágenes por consulta
- **Tamaño de archivo**: Máximo 5MB para subidas locales

### Costos

- **Gratuito**: Hasta 100 búsquedas por día
- **Pago**: $5 USD por 1000 búsquedas adicionales

### Seguridad

- Las claves de API deben mantenerse seguras
- Se recomienda restringir las claves a dominios específicos
- No compartas las claves en repositorios públicos

## Solución de problemas

### Error: "API de Google no configurada"

- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que los nombres de las variables coincidan exactamente
- Reinicia la aplicación después de cambiar las variables

### Error: "Google Search API error"

- Verifica que la API de Custom Search esté habilitada en Google Cloud Console
- Comprueba que la clave de API sea válida
- Revisa la cuota de uso en Google Cloud Console

### No se muestran resultados

- Verifica que el Search Engine ID sea correcto
- Asegúrate de que el motor de búsqueda esté configurado para buscar en toda la web
- Comprueba que no haya restricciones de contenido en el motor de búsqueda

## Personalización

### Modificar el comportamiento de búsqueda

Puedes personalizar la búsqueda editando el archivo `src/services/googleImagesAPI.ts`:

```typescript
// Cambiar el número máximo de resultados
const results = await googleImagesAPI.searchBookCovers(book.titulo, book.autor, 20);

// Modificar la consulta de búsqueda
let query = `"${bookTitle}" book cover high quality`;
```

### Personalizar la interfaz

El modal de búsqueda se encuentra en `src/components/GoogleImagesSearchModal.tsx` y puede ser personalizado según tus necesidades.

## Soporte

Si tienes problemas con la configuración o el uso de esta funcionalidad, consulta:

1. [Google Custom Search API Documentation](https://developers.google.com/custom-search/v1/overview)
2. [Google Cloud Console Help](https://cloud.google.com/docs)
3. Los logs de la consola del navegador para errores específicos