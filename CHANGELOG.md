# Changelog

## [Unreleased] - 2024-07-22

### Changed
- **Reemplazado el detector de códigos de barras con cámara por un input numérico para ISBN**
  - Eliminado `ScannerModal.tsx` que usaba la cámara para escanear códigos de barras
  - Creado `ISBNInputModal.tsx` con un input numérico para ingresar ISBN manualmente
  - Actualizado `TBRForm.tsx` para usar el nuevo modal de input ISBN
  - Cambiado el botón "Escanear ISBN" por "Buscar por ISBN"

### Removed
- Dependencias relacionadas con el scanner de códigos de barras:
  - `@zxing/browser`
  - `@zxing/library` 
  - `html5-qrcode`

### Features del nuevo ISBNInputModal
- Input numérico con validación en tiempo real de ISBN-10 e ISBN-13
- Feedback visual con iconos de estado (válido/inválido)
- Mensajes de ayuda sobre dónde encontrar el ISBN
- Validación automática del formato ISBN
- Búsqueda directa a la API de Google Books
- Interfaz moderna y responsive
- Soporte para tema oscuro/claro

### Beneficios
- Mayor compatibilidad con navegadores móviles
- No requiere permisos de cámara
- Más rápido y confiable que el escaneo
- Mejor experiencia de usuario
- Menor complejidad técnica

### Próximos pasos
- Implementar sistema de cámara optimizado para navegadores móviles
- Mejorar la validación de ISBN
- Agregar soporte para otros formatos de códigos de barras