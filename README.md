# Guardian Compras - Gestor de Biblioteca Personal

Una aplicación React TypeScript moderna para gestionar tu biblioteca personal de libros, con sistema de autenticación Firebase y sincronización en la nube.

## 🚀 Características

- **Sistema de Autenticación**: Registro, inicio de sesión y recuperación de contraseña
- **Sincronización en la Nube**: Todos los datos se sincronizan automáticamente con Firebase
- **Gestión de Libros**: Organiza tus libros por estado (leyendo, TBR, leído, etc.)
- **Sistema de Sagas**: Agrupa libros en sagas y recibe notificaciones de completado
- **Sistema de Puntos**: Gana puntos por completar libros y compra libros con ellos
- **Modo Oscuro**: Interfaz adaptativa con tema claro/oscuro
- **Responsive Design**: Funciona perfectamente en móvil y desktop
- **Migración Automática**: Migra automáticamente datos de localStorage a Firebase

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Autenticación**: Firebase Authentication
- **Base de Datos**: Firebase Firestore
- **Analytics**: Firebase Analytics
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd book-wishlist-manager
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura Firebase**
   
   a. Ve a [Firebase Console](https://console.firebase.google.com/)
   
   b. Crea un nuevo proyecto o selecciona uno existente
   
   c. Habilita Authentication:
      - Ve a Authentication > Sign-in method
      - Habilita "Email/Password"
   
   d. Habilita Firestore:
      - Ve a Firestore Database
      - Crea una base de datos en modo de prueba
   
   e. Obtén la configuración:
      - Ve a Project Settings > General
      - En "Your apps", crea una nueva app web
      - Copia la configuración

4. **Configura las variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   REACT_APP_FIREBASE_API_KEY=tu-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=tu-app-id
   ```

5. **Configura las reglas de Firestore**
   
   En Firebase Console > Firestore Database > Rules, usa estas reglas:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Los usuarios solo pueden acceder a sus propios datos
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         
         // Subcolecciones del usuario
         match /{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

6. **Ejecuta la aplicación**
   ```bash
   npm start
   ```

## 🔧 Configuración de Vercel (Opcional)

Si quieres desplegar en Vercel:

1. **Conecta tu repositorio a Vercel**
2. **Configura las variables de entorno** en Vercel Dashboard:
   - Ve a tu proyecto en Vercel
   - Settings > Environment Variables
   - Agrega todas las variables de Firebase

3. **Deploy automático**
   - Cada push a la rama principal se desplegará automáticamente

## 📱 Uso

### Registro e Inicio de Sesión
1. Al abrir la aplicación por primera vez, verás la pantalla de login
2. Puedes registrarte con email y contraseña
3. O iniciar sesión si ya tienes una cuenta
4. Usa "¿Olvidaste tu contraseña?" para recuperar acceso

### Gestión de Libros
- **Agregar libros**: Usa el botón "+" en cualquier sección
- **Cambiar estado**: Haz clic en un libro y selecciona el nuevo estado
- **Editar información**: Haz clic en un libro para editar detalles
- **Eliminar**: Usa el botón de eliminar en la tarjeta del libro

### Sistema de Sagas
- **Crear saga**: Agrega libros a una saga existente o crea una nueva
- **Ver progreso**: Las sagas muestran el progreso de lectura
- **Notificaciones**: Recibe notificaciones cuando completes una saga

### Sistema de Puntos
- **Ganar puntos**: Completa libros para ganar puntos
- **Comprar libros**: Usa puntos para "comprar" libros de tu wishlist
- **Ver estadísticas**: Consulta tu balance de puntos en el perfil

### Sincronización
- **Automática**: Los datos se sincronizan automáticamente
- **Estado**: El indicador verde muestra que todo está sincronizado
- **Offline**: La app funciona offline y sincroniza cuando hay conexión

## 🔄 Migración de Datos

Si tienes datos en localStorage de una versión anterior:

1. **Inicia sesión** con tu cuenta de Firebase
2. **Los datos se migrarán automáticamente** en el primer inicio
3. **Verifica** que todos tus libros y sagas estén presentes
4. **Los datos locales se mantienen** como respaldo

## 🎨 Personalización

### Modo Oscuro
- **Automático**: Se adapta a la preferencia del sistema
- **Manual**: Cambia en el perfil de usuario
- **Persistente**: Se recuerda entre sesiones

### Configuración
- **Puntos por libro**: Configura cuántos puntos ganas por completar un libro
- **Puntos para comprar**: Configura cuántos puntos cuesta "comprar" un libro
- **Notificaciones**: Controla las notificaciones de sagas completadas

## 🚨 Solución de Problemas

### Error de Build
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que Firebase esté correctamente configurado
- Revisa la consola del navegador para errores específicos

### Problemas de Sincronización
- Verifica tu conexión a internet
- Asegúrate de estar autenticado
- Revisa las reglas de Firestore

### Datos No Aparecen
- Verifica que hayas iniciado sesión
- Comprueba que los datos se hayan migrado correctamente
- Revisa la consola para errores de Firebase

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de Firebase
2. Consulta los logs de la consola del navegador
3. Verifica la configuración de las variables de entorno
4. Abre un issue en el repositorio

---

¡Disfruta gestionando tu biblioteca personal! 📚✨ 