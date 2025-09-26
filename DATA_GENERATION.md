# 🎭 Generación de Datos de Muestra - E-Commerce MERN

Este documento explica cómo usar los scripts para generar datos de muestra realistas que te permitan maquetar perfectamente tu sistema de comercio electrónico.

## 🚀 Setup Rápido

### Opción 1: Setup Completo Automático
```bash
# Ejecutar setup completo (recomendado)
node setup-complete.js
```

### Opción 2: Setup Manual
```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Configurar base de datos
npm run migrate

# 3. Optimizar base de datos
npm run optimize-db-with-samples

# 4. Generar todos los datos
npm run generate-all
```

## 📊 Scripts Disponibles

### 🗄️ Base de Datos
```bash
# Migrar base de datos
npm run migrate

# Optimizar base de datos con datos de ejemplo
npm run optimize-db-with-samples

# Solo optimizar (sin datos de ejemplo)
npm run optimize-db
```

### 👥 Usuarios
```bash
# Generar usuarios de muestra básicos
npm run generate-users

# Limpiar y generar usuarios nuevos
npm run generate-users-clean

# Generar usuarios + 100 usuarios aleatorios
npm run generate-users-random

# Generar usuarios + usuarios de prueba específicos
npm run generate-users-test
```

### 🛍️ Productos
```bash
# Generar productos de muestra
npm run generate-products

# Limpiar y generar productos nuevos
npm run generate-products-clean

# Generar productos + productos de prueba
npm run generate-products-test
```

### 📦 Órdenes
```bash
# Generar 100 órdenes de muestra
npm run generate-orders

# Limpiar y generar órdenes nuevas
npm run generate-orders-clean

# Generar órdenes + órdenes de prueba
npm run generate-orders-test

# Generar cantidad específica de órdenes
node scripts/generateSampleOrders.js --count 50
```

### 🎯 Todo en Uno
```bash
# Generar usuarios + productos + órdenes
npm run generate-all

# Setup completo (migración + optimización + datos)
npm run setup
```

## 👤 Usuarios Generados

### Usuarios de Muestra Predefinidos

#### 🔑 Credenciales de Acceso
| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| **Admin** | admin@mitienda.com | admin123 | Administrador principal |
| **Moderator** | moderator@mitienda.com | moderator123 | Moderador del sistema |
| **Seller** | seller1@mitienda.com | seller123 | Vendedor 1 |
| **Seller** | seller2@mitienda.com | seller123 | Vendedor 2 |
| **User** | laura.fernandez@email.com | user123 | Usuario de ejemplo |

#### 👥 Usuarios Regulares (12 usuarios)
- **Laura Fernández** - laura.fernandez@email.com
- **David Sánchez** - david.sanchez@email.com
- **Carmen Ruiz** - carmen.ruiz@email.com
- **Antonio González** - antonio.gonzalez@email.com
- **Isabel Moreno** - isabel.moreno@email.com
- **Francisco Jiménez** - francisco.jimenez@email.com
- **John Smith** - john.smith@email.com (USA)
- **Marie Dubois** - marie.dubois@email.com (Francia)
- **Giuseppe Rossi** - giuseppe.rossi@email.com (Italia)

#### 🎲 Usuarios Aleatorios
Con `--random 100` se generan 100 usuarios adicionales con:
- Nombres y apellidos españoles aleatorios
- Direcciones de diferentes ciudades españolas
- Preferencias de idioma y moneda configuradas
- 90% de usuarios activos

## 🛍️ Productos Generados

### Categorías Disponibles

#### 📱 Electrónicos (4 productos base → ~100 variaciones)
- **iPhone 15 Pro Max** - Variaciones de color y almacenamiento
- **Samsung Galaxy S24 Ultra** - Variaciones de color y almacenamiento  
- **MacBook Pro 14" M3** - Variaciones de color y almacenamiento
- **Sony WH-1000XM5** - Variaciones de color

#### 👕 Ropa (3 productos base → ~90 variaciones)
- **Camiseta Premium Algodón** - Variaciones de color y talla
- **Jeans Slim Fit Premium** - Variaciones de color y talla
- **Chaqueta Deportiva Nike** - Variaciones de color y talla

#### 🏠 Hogar (3 productos base → ~45 variaciones)
- **Set de Sábanas Premium 4 Piezas**
- **Lámpara LED Inteligente**
- **Juego de Ollas Antiadherentes**

#### ⚽ Deportes (3 productos base → ~45 variaciones)
- **Zapatillas Running Nike Air Max**
- **Mancuernas Ajustables 20kg**
- **Bicicleta de Montaña 27.5"**

#### 📚 Libros (2 productos base → ~18 variaciones)
- **El Arte de la Guerra** - Variaciones de idioma y formato
- **JavaScript: La Guía Definitiva** - Variaciones de idioma y formato

#### 🧸 Juguetes (2 productos base → ~18 variaciones)
- **Lego Creator Set Casa Modular**
- **Puzzle 1000 Piezas Paisaje**

### 🧪 Productos de Prueba
Con `--test-products` se agregan:
- **Producto Sin Stock** - Para probar manejo de stock agotado
- **Producto Precio Alto** - Para probar filtros de precio
- **Producto Inactivo** - Para probar productos desactivados

## 📦 Órdenes Generadas

### 📊 Estadísticas de Órdenes
Por defecto se generan **100 órdenes** con:

#### Estados de Órdenes
- **Pending** - Órdenes recién creadas
- **Confirmed** - Órdenes con pago confirmado
- **Processing** - Órdenes siendo preparadas
- **Shipped** - Órdenes enviadas
- **Delivered** - Órdenes entregadas

#### Métodos de Pago
- Credit Card (40%)
- Debit Card (25%)
- PayPal (20%)
- Stripe (15%)

#### Métodos de Envío
- Standard (50%)
- Express (30%)
- Overnight (20%)

#### 🎯 Datos Realistas
- **Fechas**: Últimos 90 días
- **Productos**: 1-5 productos por orden
- **Cantidades**: 1-3 unidades por producto
- **Direcciones**: 5 ciudades españolas diferentes
- **Tracking**: Números de seguimiento únicos
- **Eventos**: Timeline completa de cada orden

### 🧪 Órdenes de Prueba
Con `--test-orders` se agregan órdenes específicas para testing.

## 🎨 Personalización

### Modificar Productos
Edita `backend/scripts/generateSampleProducts.js`:
```javascript
const sampleProducts = {
    electronics: [
        {
            productName: "Tu Producto Personalizado",
            brandName: "Tu Marca",
            category: "electronics",
            // ... más propiedades
        }
    ]
};
```

### Modificar Usuarios
Edita `backend/scripts/generateSampleUsers.js`:
```javascript
const sampleUsers = [
    {
        name: "Tu Usuario",
        email: "tu@email.com",
        role: "admin",
        // ... más propiedades
    }
];
```

### Generar Cantidad Específica
```bash
# 50 órdenes
node scripts/generateSampleOrders.js --count 50

# 200 usuarios aleatorios
node scripts/generateSampleUsers.js --random 200
```

## 🔧 Comandos Útiles

### Limpiar Todo
```bash
# Limpiar usuarios (excepto admin)
npm run generate-users-clean

# Limpiar productos
npm run generate-products-clean

# Limpiar órdenes
npm run generate-orders-clean
```

### Regenerar Todo
```bash
# Regenerar todos los datos
npm run generate-all
```

### Solo Testing
```bash
# Generar solo datos de prueba
npm run generate-users-test
npm run generate-products-test
npm run generate-orders-test
```

## 📈 Estadísticas Generadas

Después de ejecutar los scripts, tendrás:

### 👥 Usuarios
- **~120 usuarios** (12 predefinidos + 100 aleatorios)
- **4 roles diferentes** (admin, moderator, seller, user)
- **Múltiples países** (España, USA, Francia, Italia)
- **Direcciones realistas** de ciudades españolas

### 🛍️ Productos
- **~316 productos únicos** (variaciones incluidas)
- **6 categorías principales**
- **Precios realistas** ($9.99 - $1,999.99)
- **Stock variable** (5-200 unidades)
- **Imágenes de Unsplash** (URLs reales)

### 📦 Órdenes
- **100 órdenes** con estados diversos
- **$15,000+ en ingresos** (órdenes entregadas)
- **Timeline completa** de eventos
- **Tracking numbers** únicos
- **Direcciones de envío** realistas

## 🚨 Solución de Problemas

### Error: "No hay usuarios disponibles"
```bash
npm run generate-users-clean
```

### Error: "No hay productos disponibles"
```bash
npm run generate-products-clean
```

### Error: "MongoDB connection failed"
1. Verifica que MongoDB esté corriendo
2. Revisa la configuración en `backend/.env`
3. Asegúrate de que `MONGODB_URI` sea correcta

### Error: "Permission denied"
```bash
chmod +x setup-complete.js
```

## 💡 Consejos

1. **Ejecuta el setup completo** la primera vez
2. **Usa `--clean`** para regenerar datos frescos
3. **Personaliza los productos** según tu negocio
4. **Ajusta las cantidades** según tus necesidades
5. **Revisa las credenciales** generadas

---

**¡Tu sistema E-Commerce ahora tiene datos realistas para una maquetación perfecta!** 🎉
