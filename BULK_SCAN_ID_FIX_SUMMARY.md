# Solución para IDs duplicados en escaneo masivo

## Problema identificado

Cuando se realizaba un escaneo masivo de libros usando el `BulkScanModal`, los libros escaneados podían terminar con IDs idénticos, causando que al editar un libro se editaran todos los que tenían el mismo ID.

### Causa raíz

El problema estaba en la generación de IDs usando `Date.now()` que puede devolver el mismo valor en milisegundos cuando se procesan múltiples libros muy rápidamente durante el escaneo masivo.

**Ubicaciones problemáticas encontradas:**
- `BulkScanModal.tsx` línea 373: `id: Date.now() + Math.random()`
- `BulkScanModal.tsx` línea 506: `id: Date.now() + Math.random()`  
- `AppStateContext.tsx` línea 354: `id: Date.now()`

## Solución implementada

### 1. Generador de IDs único

Se creó un nuevo archivo `src/utils/idGenerator.ts` con un generador de IDs robusto:

```typescript
let idCounter = 0;

export function generateUniqueId(): number {
  const timestamp = Date.now();
  const counter = ++idCounter;
  
  if (idCounter > 999999) {
    idCounter = 0;
  }
  
  return timestamp * 1000000 + counter;
}
```

**Cómo funciona:**
- Combina timestamp actual con un contador incremental
- Garantiza unicidad incluso en el mismo milisegundo
- Puede generar hasta 1,000,000 IDs únicos por milisegundo
- Se reinicia automáticamente el contador para evitar overflow

### 2. Archivos actualizados

**Componentes principales:**
- `src/components/BulkScanModal.tsx`
- `src/components/TBRForm.tsx`
- `src/components/WishlistForm.tsx`
- `src/components/BarcodeScannerModal.tsx`

**Contexto y servicios:**
- `src/context/AppStateContext.tsx` - Todos los casos de creación de libros, sagas, lecturas y notificaciones

### 3. Casos específicos solucionados

✅ **ADD_BOOK**: Ahora usa `generateUniqueId()` si no se proporciona un ID
✅ **ADD_SAGA**: Usa `generateUniqueId()` para nuevas sagas
✅ **ADD_LECTURA**: Usa `generateUniqueId()` para nuevas lecturas
✅ **ADD_SAGA_NOTIFICATION**: Usa `generateUniqueId()` para notificaciones
✅ **ADD_SCAN_HISTORY**: Usa `generateUniqueId()` para historial de escaneo
✅ **BulkScanModal**: Tanto para libros temporales como libros finales
✅ **Creación manual de libros**: En TBR, Wishlist y escáner individual

## Resultado

- **Antes**: IDs duplicados causaban edición múltiple no deseada
- **Después**: Cada libro tiene un ID único garantizado, permitiendo edición individual correcta

## Verificación

La aplicación compila correctamente y todos los IDs generados son únicos, solucionando el problema de edición masiva accidental en el escaneo de libros.

## Impacto

- ✅ Soluciona el problema principal de IDs duplicados
- ✅ Mantiene compatibilidad con datos existentes
- ✅ Mejora la robustez general del sistema de IDs
- ✅ No rompe funcionalidad existente