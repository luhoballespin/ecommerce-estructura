# 🛒 E-Commerce MERN Stack - Plataforma Empresarial

Una solución completa de comercio electrónico construida con MongoDB, Express.js, React y Node.js. Diseñada para ser escalable, flexible y adaptable a cualquier tipo de negocio.

## 🌟 Características Principales

### 🔐 Seguridad Empresarial
- ✅ Autenticación JWT robusta con refresh tokens
- ✅ Autorización basada en roles (Admin, Moderator, Seller, User)
- ✅ Rate limiting y protección contra ataques
- ✅ Validación y sanitización de datos
- ✅ Middleware de seguridad con Helmet
- ✅ Logs de seguridad y auditoría

### 🛍️ Funcionalidades de E-Commerce
- ✅ Catálogo de productos con categorías dinámicas
- ✅ Sistema de carrito de compras
- ✅ Gestión completa de órdenes
- ✅ Sistema de cupones y descuentos
- ✅ Lista de deseos (Wishlist)
- ✅ Sistema de reviews y calificaciones
- ✅ Búsqueda avanzada y filtros
- ✅ Gestión de inventario en tiempo real

### 📧 Sistema de Notificaciones
- ✅ Notificaciones por email automáticas
- ✅ Templates HTML responsivos
- ✅ Notificaciones de estado de órdenes
- ✅ Alertas de stock bajo
- ✅ Emails de bienvenida y marketing

### 📊 Analytics y Reportes
- ✅ Dashboard de administración completo
- ✅ Estadísticas de ventas en tiempo real
- ✅ Reportes de productos más vendidos
- ✅ Analytics de usuarios
- ✅ Métricas de performance

### 🔧 Arquitectura Escalable
- ✅ Arquitectura modular y mantenible
- ✅ Manejo centralizado de errores
- ✅ Sistema de logging estructurado
- ✅ Caché con Redis (opcional)
- ✅ Optimización de base de datos
- ✅ API RESTful bien documentada

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Joi** - Validación de datos
- **Nodemailer** - Envío de emails
- **Stripe** - Procesamiento de pagos
- **Helmet** - Seguridad
- **Winston** - Logging

### Frontend
- **React 18** - Biblioteca de UI
- **Redux Toolkit** - Manejo de estado
- **React Router** - Enrutamiento
- **Tailwind CSS** - Framework de CSS
- **React Icons** - Iconografía
- **React Toastify** - Notificaciones

### Herramientas de Desarrollo
- **Nodemon** - Desarrollo automático
- **ESLint** - Linting de código
- **Prettier** - Formateo de código

## 📋 Requisitos del Sistema

- Node.js 16.x o superior
- MongoDB 5.x o superior
- npm o yarn
- Git

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/ecommerce-mern.git
cd ecommerce-mern
```

### 2. Configurar Variables de Entorno

#### Backend
```bash
cd backend
cp env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=tu-clave-secreta-muy-segura
FRONTEND_URL=http://localhost:3000
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

#### Frontend
```bash
cd frontend
cp env.example .env
```

Editar el archivo `.env`:
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_CLOUD_NAME_CLOUDINARY=tu-cloud-name
```

### 3. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 4. Configurar Base de Datos
```bash
cd backend
npm run migrate
```

### 5. Ejecutar la Aplicación

#### Desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

#### Producción
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Servir archivos estáticos con nginx o similar
```

## 📚 Documentación de la API

### Autenticación
Todos los endpoints protegidos requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

### Endpoints Principales

#### Autenticación
- `POST /api/signup` - Registro de usuario
- `POST /api/signin` - Inicio de sesión
- `GET /api/userLogout` - Cerrar sesión
- `GET /api/user-details` - Obtener perfil

#### Productos
- `GET /api/get-product` - Listar productos
- `POST /api/upload-product` - Crear producto (Admin/Seller)
- `POST /api/update-product` - Actualizar producto (Admin/Seller)
- `POST /api/product-details` - Detalles del producto
- `GET /api/search` - Buscar productos
- `POST /api/filter-product` - Filtrar productos

#### Carrito
- `POST /api/addtocart` - Agregar al carrito
- `GET /api/view-card-product` - Ver carrito
- `POST /api/update-cart-product` - Actualizar carrito
- `POST /api/delete-cart-product` - Eliminar del carrito

#### Órdenes
- `POST /api/orders` - Crear orden
- `GET /api/orders` - Listar órdenes
- `GET /api/orders/:id` - Detalles de orden
- `PATCH /api/orders/:id/status` - Actualizar estado (Admin)
- `PATCH /api/orders/:id/cancel` - Cancelar orden

#### Administración
- `GET /api/all-user` - Listar usuarios (Admin)
- `GET /api/orders/admin/stats` - Estadísticas (Admin)

### Códigos de Estado HTTP
- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Error de validación
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `429` - Demasiadas solicitudes
- `500` - Error interno del servidor

## 🏗️ Arquitectura del Sistema

### Estructura de Directorios

```
backend/
├── config/           # Configuraciones
├── controller/       # Controladores
├── middleware/       # Middleware personalizado
├── models/          # Modelos de datos
├── routes/          # Rutas de la API
├── services/        # Servicios externos
├── helpers/         # Funciones auxiliares
├── logs/           # Archivos de log
└── scripts/        # Scripts de migración

frontend/
├── public/         # Archivos estáticos
├── src/
│   ├── components/ # Componentes React
│   ├── pages/      # Páginas
│   ├── store/      # Estado Redux
│   ├── helpers/    # Funciones auxiliares
│   ├── config/     # Configuraciones
│   └── context/    # Context API
└── build/          # Build de producción
```

### Modelos de Datos

#### Usuario
```javascript
{
  name: String,
  email: String (único),
  password: String (hash),
  role: ['admin', 'user', 'moderator', 'seller'],
  phone: String,
  address: Object,
  isActive: Boolean,
  preferences: Object
}
```

#### Producto
```javascript
{
  productName: String,
  brandName: String,
  category: String,
  subcategory: String,
  productImage: [String],
  description: String,
  price: Number,
  sellingPrice: Number,
  stock: Number,
  sku: String (único),
  tags: [String],
  isActive: Boolean,
  features: [Object]
}
```

#### Orden
```javascript
{
  customer: Object,
  shippingAddress: Object,
  billingAddress: Object,
  items: [Object],
  pricing: Object,
  payment: Object,
  shipping: Object,
  status: String,
  orderNumber: String (único),
  events: [Object]
}
```

## 🔧 Configuración Avanzada

### Configuración de Email

#### Gmail
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
```

#### SendGrid
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=tu-api-key
```

### Configuración de Pagos (Stripe)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Configuración de Cloudinary
```env
REACT_APP_CLOUD_NAME_CLOUDINARY=tu-cloud-name
```

## 🚀 Despliegue

### Docker
```bash
# Construir imagen
docker build -t ecommerce-mern .

# Ejecutar contenedor
docker run -p 8080:8080 -p 3000:3000 ecommerce-mern
```

### Heroku
```bash
# Backend
heroku create tu-app-backend
heroku addons:create mongolab:sandbox
git push heroku main

# Frontend
heroku create tu-app-frontend
git push heroku main
```

### Vercel (Frontend)
```bash
vercel --prod
```

## 📊 Monitoreo y Logs

### Logs
Los logs se almacenan en `backend/logs/`:
- `app.log` - Logs generales
- `errors.log` - Solo errores
- `user-activity.log` - Actividad de usuarios
- `security.log` - Eventos de seguridad

### Health Checks
- Backend: `GET /health`
- Órdenes: `GET /api/orders/health`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles completos

## 🔮 Roadmap

### Versión 2.1
- [ ] Integración con más pasarelas de pago
- [ ] Sistema de afiliados
- [ ] API para aplicaciones móviles
- [ ] Integración con ERP

### Versión 2.2
- [ ] Chat en vivo
- [ ] Sistema de tickets de soporte
- [ ] Marketplace multi-vendor
- [ ] Integración con redes sociales

---

**Desarrollado con ❤️ para el comercio electrónico moderno**