# Guía del Escáner de Códigos de Barras

## Funcionalidad

La aplicación ahora incluye un escáner de códigos de barras que permite escanear códigos ISBN directamente desde la cámara del dispositivo para agregar libros rápidamente a tu pila de lectura.

## Cómo Usar el Escáner

### 1. Acceder al Escáner
1. Abre la aplicación
2. Ve a la sección "Agregar a Pila de Lectura"
3. Haz clic en "Agregar nuevo libro a la pila"
4. Verás dos botones:
   - **"Buscar por ISBN"**: Para ingresar el ISBN manualmente
   - **"Escanear Código"**: Para escanear el código de barras con la cámara

### 2. Escanear un Libro
1. Haz clic en el botón **"Escanear Código"**
2. Permite el acceso a la cámara cuando el navegador lo solicite
3. El sistema seleccionará automáticamente la mejor cámara disponible
4. Apunta la cámara al código de barras del libro
5. El código debe estar dentro del marco rojo que aparece en pantalla
6. Mantén el código estable hasta que se detecte
7. El sistema validará automáticamente si es un ISBN válido
8. Si es válido, se buscará la información del libro automáticamente
9. El escáner se cerrará automáticamente y los datos del libro se rellenarán en el formulario

### 3. Controles del Escáner

#### Botones Disponibles:
- **"Cambiar Cámara"**: Alterna entre cámaras disponibles (frontal/trasera)
- **"Iniciar/Detener"**: Controla el estado del escáner
- **"X"**: Cierra el escáner y regresa al formulario

#### Selección Automática de Cámara:
- El sistema selecciona automáticamente la cámara trasera principal
- Si no hay cámara trasera, selecciona la frontal
- Puedes cambiar manualmente si la cámara seleccionada no enfoca bien

#### Estados del Escáner:
- **Escaneando**: Buscando códigos de barras
- **Procesando**: Validando ISBN y buscando información
- **Detenido**: Escáner pausado

## Características Técnicas

### Compatibilidad
- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Móviles, tablets, computadoras con cámara
- **Códigos**: ISBN-10 e ISBN-13

### Validación Automática
El escáner incluye validación automática de ISBN:
- **ISBN-10**: Algoritmo de verificación con dígito de control
- **ISBN-13**: Algoritmo EAN-13 con dígito de control
- **Limpieza**: Elimina caracteres no válidos automáticamente

### Prevención de Duplicados
- El sistema evita escanear el mismo código múltiples veces
- Feedback visual para cada acción del usuario

## Consejos para un Escaneo Exitoso

### Iluminación
- Asegúrate de tener buena iluminación
- Evita sombras sobre el código de barras
- En exteriores, evita la luz directa del sol

### Posicionamiento
- Mantén el código de barras estable
- El código debe estar completamente dentro del marco rojo
- Mantén una distancia de 10-30 cm del código
- Si no enfoca bien, usa el botón "Cambiar Cámara"

### Calidad del Código
- El código debe estar en buen estado (no dañado)
- Evita códigos muy pequeños o borrosos
- Asegúrate de que el código esté limpio

## Solución de Problemas

### Error: "No se encontraron cámaras disponibles"
- Verifica que tu dispositivo tenga cámara
- Asegúrate de que el navegador tenga permisos de cámara
- Intenta recargar la página

### Error: "Permiso de cámara denegado"
- Haz clic en el ícono de cámara en la barra de direcciones
- Selecciona "Permitir" para el acceso a la cámara
- Recarga la página si es necesario

### El escáner no detecta códigos
- Verifica la iluminación
- Asegúrate de que el código esté dentro del marco
- Intenta cambiar de cámara usando el botón "Cambiar Cámara"
- Verifica que el código no esté dañado
- Algunas cámaras enfocan mejor que otras para códigos de barras

### "Código detectado pero no es un ISBN válido"
- Verifica que estés escaneando un código ISBN real
- Algunos códigos de barras no son ISBN (pueden ser códigos internos)
- Intenta escanear desde un ángulo diferente

### Error de red al buscar información
- Verifica tu conexión a internet
- El libro puede no estar en la base de datos de Google Books
- Puedes agregar el libro manualmente si no se encuentra

## Funcionalidades Adicionales

### Múltiples Cámaras
- Si tu dispositivo tiene múltiples cámaras, puedes alternar entre ellas
- Útil para cambiar entre cámara frontal y trasera

### Feedback en Tiempo Real
- Mensajes informativos sobre el estado del escáner
- Indicadores visuales de éxito y error
- Auto-eliminación de mensajes después de 3 segundos

### Integración Automática
- Los datos del libro se rellenan automáticamente
- No necesitas copiar y pegar información
- Puedes editar los datos antes de guardar

## Limitaciones

### Compatibilidad del Navegador
- Requiere soporte para WebRTC
- Algunos navegadores antiguos pueden no funcionar
- Safari en iOS requiere HTTPS para acceder a la cámara

### Tipos de Códigos
- Solo funciona con códigos ISBN
- No detecta códigos QR
- No funciona con códigos de barras internos de librerías

### Calidad de la Cámara
- La calidad de detección depende de la cámara del dispositivo
- Cámaras de baja resolución pueden tener dificultades
- El enfoque automático debe estar habilitado

## Próximas Mejoras

- [ ] Soporte para códigos QR
- [ ] Modo de escaneo continuo
- [ ] Historial de libros escaneados
- [ ] Mejoras en la detección de códigos dañados
- [ ] Soporte para múltiples formatos de códigos de barras
- [ ] Modo offline con caché de datos

## Soporte

Si tienes problemas con el escáner:
1. Verifica que tu dispositivo y navegador sean compatibles
2. Asegúrate de tener permisos de cámara
3. Intenta con diferentes códigos de barras
4. Si el problema persiste, puedes usar la entrada manual de ISBN