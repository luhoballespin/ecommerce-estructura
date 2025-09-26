# 🔐 Configuración de Google OAuth - E-Commerce MERN

Esta guía te ayudará a configurar la autenticación con Google OAuth para tu aplicación E-Commerce.

## 📋 **PASOS PARA CONFIGURAR GOOGLE OAUTH**

### 1. **Crear Proyecto en Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** o **Google Identity API**

### 2. **Configurar OAuth Consent Screen**

1. En el menú lateral, ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** (para usuarios externos)
3. Completa la información requerida:
   - **App name**: Mi Tienda Online
   - **User support email**: tu-email@ejemplo.com
   - **Developer contact information**: tu-email@ejemplo.com
4. Agrega los **scopes** necesarios:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Guarda y continúa

### 3. **Crear Credenciales OAuth**

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth 2.0 Client IDs**
3. Selecciona **Web application**
4. Configura las URLs:

#### **Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:8080
https://tu-dominio.com (para producción)
```

#### **Authorized redirect URIs:**
```
http://localhost:8080/api/auth/google/callback
https://tu-dominio.com/api/auth/google/callback (para producción)
```

5. Haz clic en **Create**
6. Copia el **Client ID** y **Client Secret**

### 4. **Configurar Variables de Entorno**

#### **Backend (.env)**
```bash
# ==================== CONFIGURACIÓN DE GOOGLE OAUTH ====================
GOOGLE_CLIENT_ID=tu-google-client-id-aqui
GOOGLE_CLIENT_SECRET=tu-google-client-secret-aqui
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
```

#### **Frontend (.env)**
```bash
# ==================== CONFIGURACIÓN DE GOOGLE OAUTH ====================
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id-aqui
REACT_APP_GOOGLE_CLIENT_SECRET=tu-google-client-secret-aqui
```

### 5. **Verificar Configuración**

1. **Reinicia el servidor backend** después de agregar las variables de entorno
2. **Reinicia el servidor frontend** después de agregar las variables de entorno
3. Ve a `http://localhost:3000/login`
4. Haz clic en **"Continuar con Google"**
5. Deberías ser redirigido a Google para autenticación

## 🔧 **SOLUCIÓN DE PROBLEMAS**

### **Error: "redirect_uri_mismatch"**
- Verifica que las URLs en Google Cloud Console coincidan exactamente
- Asegúrate de incluir `http://localhost:8080/api/auth/google/callback`

### **Error: "invalid_client"**
- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que las variables de entorno estén configuradas correctamente

### **Error: "access_denied"**
- El usuario canceló la autorización
- Verifica que el OAuth consent screen esté configurado correctamente

### **Error: "unauthorized_client"**
- El Client ID no está autorizado para el tipo de aplicación
- Asegúrate de haber seleccionado "Web application"

## 🚀 **CONFIGURACIÓN PARA PRODUCCIÓN**

### 1. **Actualizar URLs en Google Cloud Console**
```bash
# Authorized JavaScript origins
https://tu-dominio.com

# Authorized redirect URIs
https://tu-dominio.com/api/auth/google/callback
```

### 2. **Actualizar Variables de Entorno**
```bash
# Backend (.env)
GOOGLE_CLIENT_ID=tu-google-client-id-produccion
GOOGLE_CLIENT_SECRET=tu-google-client-secret-produccion
GOOGLE_CALLBACK_URL=https://tu-dominio.com/api/auth/google/callback

# Frontend (.env)
REACT_APP_GOOGLE_CLIENT_ID=tu-google-client-id-produccion
REACT_APP_GOOGLE_CLIENT_SECRET=tu-google-client-secret-produccion
```

### 3. **Verificar OAuth Consent Screen**
- Cambia el estado a **"In production"** cuando esté listo
- Agrega el dominio de producción en **Authorized domains**

## 📱 **FUNCIONALIDADES IMPLEMENTADAS**

### ✅ **Autenticación con Google**
- Login directo con cuenta de Google
- Creación automática de usuarios
- Vinculación de cuentas existentes

### ✅ **Interfaz Moderna**
- Diseño responsivo y atractivo
- Animaciones suaves
- Feedback visual en tiempo real

### ✅ **Manejo de Errores**
- Páginas de éxito y error dedicadas
- Mensajes de error descriptivos
- Opciones de recuperación

### ✅ **Seguridad**
- Tokens JWT seguros
- Validación de origen
- Manejo seguro de cookies

## 🎯 **PRÓXIMOS PASOS**

1. **Configurar Google OAuth** siguiendo esta guía
2. **Probar la autenticación** en desarrollo
3. **Configurar para producción** cuando esté listo
4. **Agregar más proveedores** (Facebook, GitHub, etc.)

## 📞 **SOPORTE**

Si tienes problemas con la configuración:

1. **Revisa los logs** del servidor backend
2. **Verifica las variables de entorno**
3. **Comprueba las URLs** en Google Cloud Console
4. **Contacta soporte** si el problema persiste

---

**¡Tu sistema de autenticación con Google está listo para usar!** 🎉
