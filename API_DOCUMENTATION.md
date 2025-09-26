# 📚 Documentación de la API - E-Commerce MERN

## 📖 Índice

1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints de Usuario](#endpoints-de-usuario)
4. [Endpoints de Productos](#endpoints-de-productos)
5. [Endpoints de Carrito](#endpoints-de-carrito)
6. [Endpoints de Órdenes](#endpoints-de-órdenes)
7. [Endpoints de Administración](#endpoints-de-administración)
8. [Códigos de Error](#códigos-de-error)
9. [Ejemplos de Uso](#ejemplos-de-uso)

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Los tokens se envían en el header `Authorization`:

```
Authorization: Bearer <token>
```

### Obtener Token
```http
POST /api/signin
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "error": false,
  "message": "Login successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "Juan Pérez",
      "email": "usuario@ejemplo.com",
      "role": "user"
    }
  }
}
```

## 👤 Endpoints de Usuario

### Registro de Usuario
```http
POST /api/signup
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "phone": "+1234567890"
}
```

**Respuesta:**
```json
{
  "success": true,
  "error": false,
  "message": "User created Successfully!",
  "data": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Obtener Perfil del Usuario
```http
GET /api/user-details
Authorization: Bearer <token>
```

### Actualizar Perfil
```http
POST /api/update-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Juan Carlos Pérez",
  "phone": "+1234567890",
  "address": {
    "street": "Calle Principal 123",
    "city": "Ciudad",
    "state": "Estado",
    "zipCode": "12345",
    "country": "País"
  }
}
```

### Cerrar Sesión
```http
GET /api/userLogout
Authorization: Bearer <token>
```

## 🛍️ Endpoints de Productos

### Listar Productos
```http
GET /api/get-product?page=1&limit=12&category=electronics&sortBy=price&sortOrder=asc
```

**Parámetros de Query:**
- `page` - Número de página (default: 1)
- `limit` - Productos por página (default: 12)
- `category` - Filtrar por categoría
- `sortBy` - Campo para ordenar (price, createdAt, productName)
- `sortOrder` - Orden (asc, desc)

**Respuesta:**
```json
{
  "success": true,
  "error": false,
  "message": "Products fetched successfully",
  "data": {
    "products": [
      {
        "id": "64a1b2c3d4e5f6789abcdef1",
        "productName": "iPhone 14 Pro",
        "brandName": "Apple",
        "category": "electronics",
        "productImage": ["https://example.com/image1.jpg"],
        "price": 999.99,
        "sellingPrice": 899.99,
        "stock": 50,
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalProducts": 120,
      "hasNextPage": true
    }
  }
}
```

### Obtener Detalles de Producto
```http
POST /api/product-details
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6789abcdef1"
}
```

### Buscar Productos
```http
GET /api/search?q=iphone&category=electronics&minPrice=500&maxPrice=1000
```

### Filtrar Productos
```http
POST /api/filter-product
Content-Type: application/json

{
  "category": "electronics",
  "minPrice": 500,
  "maxPrice": 1000,
  "brands": ["Apple", "Samsung"],
  "inStock": true
}
```

### Crear Producto (Admin/Seller)
```http
POST /api/upload-product
Authorization: Bearer <token>
Content-Type: application/json

{
  "productName": "iPhone 14 Pro",
  "brandName": "Apple",
  "category": "electronics",
  "subcategory": "smartphones",
  "productImage": ["https://example.com/image1.jpg"],
  "description": "El iPhone más avanzado de Apple",
  "price": 999.99,
  "sellingPrice": 899.99,
  "stock": 50,
  "sku": "IPH14P-256-BLK",
  "tags": ["smartphone", "apple", "premium"],
  "features": [
    {
      "name": "Pantalla",
      "value": "6.1 pulgadas Super Retina XDR"
    }
  ]
}
```

### Actualizar Producto (Admin/Seller)
```http
POST /api/update-product
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6789abcdef1",
  "price": 949.99,
  "stock": 75
}
```

## 🛒 Endpoints de Carrito

### Agregar Producto al Carrito
```http
POST /api/addtocart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6789abcdef1",
  "quantity": 2
}
```

### Ver Carrito
```http
GET /api/view-card-product
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "error": false,
  "message": "Cart products fetched successfully",
  "data": {
    "cartItems": [
      {
        "productId": {
          "id": "64a1b2c3d4e5f6789abcdef1",
          "productName": "iPhone 14 Pro",
          "productImage": ["https://example.com/image1.jpg"],
          "sellingPrice": 899.99
        },
        "quantity": 2,
        "userId": "64a1b2c3d4e5f6789abcdef0"
      }
    ],
    "totalItems": 2,
    "totalPrice": 1799.98
  }
}
```

### Actualizar Cantidad en Carrito
```http
POST /api/update-cart-product
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6789abcdef1",
  "quantity": 3
}
```

### Eliminar del Carrito
```http
POST /api/delete-cart-product
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6789abcdef1"
}
```

### Contar Productos en Carrito
```http
GET /api/countAddToCartProduct
Authorization: Bearer <token>
```

## 📦 Endpoints de Órdenes

### Crear Orden
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "Calle Principal 123",
    "city": "Ciudad",
    "state": "Estado",
    "zipCode": "12345",
    "country": "País",
    "instructions": "Entregar en horario de oficina"
  },
  "billingAddress": {
    "street": "Calle Principal 123",
    "city": "Ciudad",
    "state": "Estado",
    "zipCode": "12345",
    "country": "País"
  },
  "paymentMethod": "credit_card",
  "shippingMethod": "standard",
  "couponCode": "DESCUENTO10",
  "notes": "Por favor entregar antes de las 5 PM"
}
```

**Respuesta:**
```json
{
  "success": true,
  "error": false,
  "message": "Orden creada exitosamente",
  "data": {
    "orderId": "64a1b2c3d4e5f6789abcdef2",
    "orderNumber": "ORD-1705312200000-0001",
    "total": 1699.98,
    "status": "pending",
    "paymentStatus": "pending",
    "items": 2
  }
}
```

### Listar Órdenes del Usuario
```http
GET /api/orders?page=1&limit=10&status=pending,confirmed&sortBy=createdAt&sortOrder=desc
```

**Parámetros de Query:**
- `page` - Número de página
- `limit` - Órdenes por página
- `status` - Filtrar por estado (comma-separated)
- `paymentStatus` - Filtrar por estado de pago
- `shippingStatus` - Filtrar por estado de envío
- `sortBy` - Campo para ordenar
- `sortOrder` - Orden (asc, desc)
- `startDate` - Fecha de inicio (ISO string)
- `endDate` - Fecha de fin (ISO string)
- `search` - Buscar por número de orden o nombre de producto

### Obtener Detalles de Orden
```http
GET /api/orders/64a1b2c3d4e5f6789abcdef2
Authorization: Bearer <token>
```

### Cancelar Orden (Usuario)
```http
PATCH /api/orders/64a1b2c3d4e5f6789abcdef2/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Cambié de opinión sobre el producto"
}
```

### Agregar Nota a Orden
```http
POST /api/orders/64a1b2c3d4e5f6789abcdef2/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "Por favor llamar antes de entregar",
  "type": "customer"
}
```

## 👨‍💼 Endpoints de Administración

### Listar Usuarios (Admin/Moderator)
```http
GET /api/all-user?page=1&limit=20&role=user&isActive=true
Authorization: Bearer <admin-token>
```

### Obtener Estadísticas de Órdenes (Admin/Moderator)
```http
GET /api/orders/admin/stats?period=30d&groupBy=day
Authorization: Bearer <admin-token>
```

**Respuesta:**
```json
{
  "success": true,
  "error": false,
  "message": "Estadísticas de órdenes obtenidas exitosamente",
  "data": {
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "duration": "30d"
    },
    "general": {
      "totalOrders": 150,
      "totalRevenue": 45000.50,
      "averageOrderValue": 300.00,
      "totalItems": 300
    },
    "byStatus": [
      {
        "_id": "delivered",
        "count": 120,
        "totalValue": 36000.00
      }
    ],
    "byPaymentMethod": [
      {
        "_id": "credit_card",
        "count": 100,
        "totalValue": 30000.00
      }
    ],
    "timeline": [
      {
        "_id": {
          "year": 2024,
          "month": 1,
          "day": 15
        },
        "orders": 5,
        "revenue": 1500.00
      }
    ]
  }
}
```

### Actualizar Estado de Orden (Admin/Moderator)
```http
PATCH /api/orders/64a1b2c3d4e5f6789abcdef2/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "shipped",
  "note": "Orden enviada con número de seguimiento TRK-123456"
}
```

### Actualizar Información de Envío (Admin/Moderator)
```http
PATCH /api/orders/64a1b2c3d4e5f6789abcdef2/shipping
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "trackingNumber": "TRK-123456789",
  "carrier": "FedEx",
  "estimatedDelivery": "2024-01-20T18:00:00.000Z",
  "note": "Paquete enviado por FedEx Express"
}
```

### Procesar Reembolso (Admin)
```http
POST /api/orders/64a1b2c3d4e5f6789abcdef2/refund
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "amount": 899.99,
  "reason": "Producto defectuoso",
  "method": "original_payment"
}
```

## ❌ Códigos de Error

### Errores de Validación (400)
```json
{
  "success": false,
  "error": true,
  "message": "Datos de entrada inválidos",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### Error de Autenticación (401)
```json
{
  "success": false,
  "error": true,
  "message": "Token de acceso requerido",
  "code": "NO_TOKEN"
}
```

### Error de Autorización (403)
```json
{
  "success": false,
  "error": true,
  "message": "Permisos insuficientes",
  "code": "INSUFFICIENT_PERMISSIONS",
  "requiredRoles": ["admin"],
  "userRole": "user"
}
```

### Recurso No Encontrado (404)
```json
{
  "success": false,
  "error": true,
  "message": "Producto no encontrado",
  "code": "PRODUCT_NOT_FOUND"
}
```

### Demasiadas Solicitudes (429)
```json
{
  "success": false,
  "error": true,
  "message": "Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos",
  "code": "TOO_MANY_REQUESTS",
  "retryAfter": 900
}
```

### Error Interno del Servidor (500)
```json
{
  "success": false,
  "error": true,
  "message": "Error interno del servidor",
  "code": "INTERNAL_ERROR"
}
```

## 🔍 Ejemplos de Uso

### Flujo Completo de Compra

#### 1. Buscar Productos
```http
GET /api/search?q=laptop&category=electronics&minPrice=500&maxPrice=1500
```

#### 2. Agregar al Carrito
```http
POST /api/addtocart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "64a1b2c3d4e5f6789abcdef1",
  "quantity": 1
}
```

#### 3. Ver Carrito
```http
GET /api/view-card-product
Authorization: Bearer <token>
```

#### 4. Crear Orden
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "Calle Principal 123",
    "city": "Ciudad",
    "state": "Estado",
    "zipCode": "12345",
    "country": "País"
  },
  "paymentMethod": "credit_card",
  "shippingMethod": "standard"
}
```

#### 5. Verificar Estado de Orden
```http
GET /api/orders/64a1b2c3d4e5f6789abcdef2
Authorization: Bearer <token>
```

### Flujo de Administración

#### 1. Ver Estadísticas
```http
GET /api/orders/admin/stats?period=7d
Authorization: Bearer <admin-token>
```

#### 2. Actualizar Estado de Orden
```http
PATCH /api/orders/64a1b2c3d4e5f6789abcdef2/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "shipped",
  "note": "Orden enviada exitosamente"
}
```

#### 3. Agregar Información de Seguimiento
```http
PATCH /api/orders/64a1b2c3d4e5f6789abcdef2/shipping
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "trackingNumber": "TRK-123456789",
  "carrier": "FedEx"
}
```

## 📝 Notas Importantes

1. **Rate Limiting**: La API tiene límites de velocidad para prevenir abuso:
   - 100 requests por 15 minutos por IP
   - 5 intentos de login por 15 minutos por IP
   - 3 registros por hora por IP

2. **Paginación**: Todos los endpoints que devuelven listas soportan paginación con `page` y `limit`.

3. **Filtros**: Muchos endpoints soportan filtros avanzados para búsquedas específicas.

4. **Ordenamiento**: Los endpoints de listado soportan ordenamiento por diferentes campos.

5. **Seguridad**: Todos los endpoints sensibles requieren autenticación y autorización apropiada.

6. **Logs**: Todas las acciones importantes se registran para auditoría y debugging.

---

**Versión de la API: 2.0.0**  
**Última actualización: Enero 2024**
