# 🚀 Guía de Despliegue - E-commerce Full Stack

Esta guía te ayudará a desplegar tu aplicación de e-commerce en **Vercel** (frontend) y **Render** (backend) de forma segura y profesional.

## 📋 Prerrequisitos

- [ ] Cuenta en [Vercel](https://vercel.com)
- [ ] Cuenta en [Render](https://render.com)
- [ ] Cuenta en [MongoDB Atlas](https://mongodb.com/atlas) (recomendado)
- [ ] Cuenta en [Stripe](https://stripe.com) para pagos
- [ ] Cuenta en [SendGrid](https://sendgrid.com) para emails (opcional)
- [ ] Dominio personalizado (opcional pero recomendado)

## 🔧 Configuración Inicial

### 1. Preparar Variables de Entorno

#### Backend (Render)
Crea un archivo `.env` en la raíz del proyecto con estas variables:

```bash
# Configuración del servidor
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Base de datos MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# Seguridad (GENERA CLAVES ÚNICAS Y SEGURAS)
JWT_SECRET=tu-clave-jwt-super-segura-minimo-32-caracteres
TOKEN_SECRET_KEY=tu-clave-token-super-segura-minimo-32-caracteres
SESSION_SECRET=tu-session-secret-super-seguro-minimo-32-caracteres

# URLs del frontend
FRONTEND_URL=https://tu-dominio-frontend.vercel.app
PRODUCTION_DOMAIN=https://tu-dominio.com

# Stripe (usar claves de producción)
STRIPE_SECRET_KEY=sk_live_tu-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_tu-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret

# Email
SENDGRID_API_KEY=tu-sendgrid-api-key
EMAIL_FROM_EMAIL=noreply@tu-dominio.com
EMAIL_FROM_NAME=Mi Tienda Online

# Configuración de la app
APP_NAME=Mi Tienda Online
ADMIN_EMAIL=admin@tu-dominio.com
LOG_LEVEL=warn
```

#### Frontend (Vercel)
```bash
REACT_APP_API_URL=https://tu-backend-en-render.onrender.com
REACT_APP_CLOUD_NAME_CLOUDINARY=tu-cloud-name
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_tu-stripe-publishable-key
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
GENERATE_SOURCEMAP=false
```

## 🎯 Despliegue en Render (Backend)

### 1. Conectar Repositorio
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub

### 2. Configurar el Servicio
- **Name**: `ecommerce-backend`
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Plan**: `Free` (para empezar)

### 3. Variables de Entorno en Render
Agrega todas las variables del archivo `.env` en la sección "Environment Variables" de Render.

### 4. Configurar Base de Datos
1. En Render Dashboard, crea un "MongoDB" service
2. Copia la connection string
3. Actualiza `MONGODB_URI` en las variables de entorno

### 5. Configurar Dominio Personalizado (Opcional)
1. Ve a "Settings" → "Custom Domains"
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## 🎨 Despliegue en Vercel (Frontend)

### 1. Conectar Repositorio
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub

### 2. Configurar el Proyecto
- **Framework Preset**: `Create React App`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### 3. Variables de Entorno en Vercel
Agrega todas las variables del frontend en "Environment Variables".

### 4. Configurar Dominio Personalizado
1. Ve a "Settings" → "Domains"
2. Agrega tu dominio personalizado
3. Configura los registros DNS

## 🔐 Configuración de Seguridad

### 1. Generar Claves Secretas Seguras
```bash
# Generar claves de 64 caracteres
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configurar HTTPS
- Render y Vercel proporcionan HTTPS automáticamente
- Para dominios personalizados, configura SSL

### 3. Configurar CORS
El backend ya está configurado para manejar CORS correctamente según el entorno.

## 📊 Configuración de Monitoreo

### 1. Sentry (Opcional)
1. Crea una cuenta en [Sentry](https://sentry.io)
2. Obtén tu DSN
3. Agrega `SENTRY_DSN` a las variables de entorno

### 2. Google Analytics
1. Crea una propiedad en [Google Analytics](https://analytics.google.com)
2. Obtén tu ID de seguimiento
3. Agrega `REACT_APP_GOOGLE_ANALYTICS_ID` al frontend

## 🧪 Verificación Post-Despliegue

### 1. Verificar Backend
```bash
# Health check
curl https://tu-backend-en-render.onrender.com/health

# Debe responder:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### 2. Verificar Frontend
1. Visita tu dominio de Vercel
2. Verifica que se cargue correctamente
3. Prueba la navegación entre páginas

### 3. Verificar Integraciones
- [ ] Registro de usuarios
- [ ] Login/logout
- [ ] Subida de productos (admin)
- [ ] Proceso de compra
- [ ] Pagos con Stripe
- [ ] Envío de emails

## 🔄 Actualizaciones Automáticas

### GitHub Actions (Opcional)
Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 Solución de Problemas

### Backend no inicia
1. Verifica las variables de entorno
2. Revisa los logs en Render Dashboard
3. Asegúrate de que MongoDB esté accesible

### Frontend no se conecta al backend
1. Verifica `REACT_APP_API_URL`
2. Revisa la configuración de CORS
3. Comprueba que el backend esté funcionando

### Errores de CORS
1. Verifica `FRONTEND_URL` en el backend
2. Asegúrate de que coincida con el dominio de Vercel

### Problemas con Stripe
1. Verifica las claves de API
2. Asegúrate de usar claves de producción
3. Configura webhooks correctamente

## 📈 Optimizaciones de Rendimiento

### Backend
- Usa índices de base de datos apropiados
- Implementa caché con Redis (opcional)
- Configura rate limiting

### Frontend
- Optimiza imágenes
- Usa lazy loading
- Implementa service workers para caché

## 🔒 Mejores Prácticas de Seguridad

1. **Nunca** commites archivos `.env` al repositorio
2. Usa claves secretas únicas y largas
3. Habilita HTTPS en todos los dominios
4. Configura rate limiting apropiado
5. Mantén las dependencias actualizadas
6. Monitorea logs de seguridad regularmente

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs en Render/Vercel Dashboard
2. Verifica la configuración de variables de entorno
3. Consulta la documentación de cada plataforma
4. Revisa este guía paso a paso

---

¡Felicitaciones! 🎉 Tu aplicación de e-commerce está ahora desplegada en producción con todas las medidas de seguridad implementadas.
