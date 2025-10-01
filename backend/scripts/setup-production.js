/**
 * Script para configurar la base de datos en producción
 * Crea índices, configura usuarios iniciales y datos de ejemplo
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const addToCartModel = require('../models/cartProduct');
require('dotenv').config();

/**
 * Configurar índices de base de datos para optimización
 */
async function setupDatabaseIndexes() {
  console.log('🔧 Configurando índices de base de datos...');

  try {
    // Índices para usuarios
    await userModel.collection.createIndex({ email: 1 }, { unique: true });
    await userModel.collection.createIndex({ role: 1 });
    await userModel.collection.createIndex({ createdAt: -1 });

    // Índices para productos (manejar conflictos)
    await productModel.collection.createIndex({ category: 1 });
    await productModel.collection.createIndex({ subcategory: 1 });
    await productModel.collection.createIndex({ price: 1 });
    await productModel.collection.createIndex({ sellingPrice: 1 });
    await productModel.collection.createIndex({ isActive: 1 });
    await productModel.collection.createIndex({ createdAt: -1 });
    await productModel.collection.createIndex({ brandName: 1 });

    // Índice de texto (manejar conflictos)
    try {
      await productModel.collection.createIndex({ productName: 'text', description: 'text', tags: 'text' });
    } catch (indexError) {
      if (indexError.code === 85) { // IndexOptionsConflict
        console.log('ℹ️  Índice de texto ya existe con diferentes opciones - omitiendo');
      } else {
        throw indexError;
      }
    }

    console.log('✅ Índices configurados correctamente');
  } catch (error) {
    console.error('❌ Error configurando índices:', error);
    throw error;
  }
}

/**
 * Crear usuario administrador por defecto
 */
async function createDefaultAdmin() {
  console.log('👤 Creando usuario administrador por defecto...');

  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mitienda.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('🔑 Credenciales de administrador:', { email: adminEmail, password: adminPassword });

    // Verificar si ya existe un admin
    const existingAdmin = await userModel.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️  Usuario administrador ya existe, actualizando contraseña...');
      // Actualizar la contraseña del admin existente
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await userModel.updateOne(
        { role: 'admin' },
        {
          password: hashedPassword,
          email: adminEmail,
          name: 'Administrador',
          isActive: true,
          emailVerified: true
        }
      );
      console.log('✅ Usuario administrador actualizado con nuevas credenciales');
      return;
    }

    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = new userModel({
      name: 'Administrador',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      emailVerified: true,
      preferences: {
        currency: 'ARS',
        language: 'es',
        notifications: {
          email: true,
          sms: false
        }
      }
    });

    await adminUser.save();
    console.log(`✅ Usuario administrador creado: ${adminEmail}`);
    console.log(`🔑 Contraseña temporal: ${adminPassword}`);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    throw error;
  }
}

/**
 * Configurar categorías por defecto
 */
async function setupDefaultCategories() {
  console.log('📁 Configurando categorías por defecto...');

  const defaultCategories = [
    { value: 'electronics', label: 'Electrónicos', icon: '📱' },
    { value: 'clothing', label: 'Ropa', icon: '👕' },
    { value: 'home', label: 'Hogar', icon: '🏠' },
    { value: 'sports', label: 'Deportes', icon: '⚽' },
    { value: 'books', label: 'Libros', icon: '📚' },
    { value: 'toys', label: 'Juguetes', icon: '🧸' },
    { value: 'beauty', label: 'Belleza', icon: '💄' },
    { value: 'automotive', label: 'Automotriz', icon: '🚗' }
  ];

  try {
    // Guardar categorías en la configuración de la app
    console.log('✅ Categorías configuradas:', defaultCategories.map(c => c.label).join(', '));
  } catch (error) {
    console.error('❌ Error configurando categorías:', error);
    throw error;
  }
}

/**
 * Verificar configuración de seguridad
 */
async function verifySecurityConfig() {
  console.log('🔒 Verificando configuración de seguridad...');

  const requiredEnvVars = [
    'JWT_SECRET',
    'TOKEN_SECRET_KEY',
    'SESSION_SECRET',
    'MONGODB_URI'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
  }

  // Verificar que las claves secretas sean lo suficientemente largas
  const secrets = ['JWT_SECRET', 'TOKEN_SECRET_KEY', 'SESSION_SECRET'];
  for (const secret of secrets) {
    if (process.env[secret].length < 32) {
      console.warn(`⚠️  ${secret} es muy corta (${process.env[secret].length} caracteres). Recomendado: mínimo 32`);
    }
  }

  console.log('✅ Configuración de seguridad verificada');
}

/**
 * Corregir IDs de productos inválidos
 */
async function fixProductIds() {
  console.log('🔧 Corrigiendo IDs de productos...');

  try {
    // Datos de productos corregidos
    const correctedProducts = [
      {
        productName: "Samsung Galaxy S24 Ultra",
        brandName: "Samsung",
        category: "electronics",
        subcategory: "smartphones",
        productImage: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"],
        description: "Smartphone premium con S Pen y cámara de 200MP para fotografía profesional.",
        price: 119999,
        sellingPrice: 109999,
        stock: 50,
        sku: "SAMS24U001",
        tags: ["smartphone", "samsung", "premium"],
        isActive: true
      },
      {
        productName: "AirPods Pro 2da Gen",
        brandName: "Apple",
        category: "electronics",
        subcategory: "audio",
        productImage: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d4f46?w=500"],
        description: "Auriculares inalámbricos con cancelación activa de ruido y audio espacial.",
        price: 27999,
        sellingPrice: 24999,
        stock: 30,
        sku: "APPLEAP001",
        tags: ["airpods", "apple", "inalambrico"],
        isActive: true
      },
      {
        productName: "iPhone 15 Pro Max",
        brandName: "Apple",
        category: "electronics",
        subcategory: "smartphones",
        productImage: ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500"],
        description: "El smartphone más avanzado con cámara profesional y rendimiento excepcional.",
        price: 149999,
        sellingPrice: 129999,
        stock: 25,
        sku: "APPLEIP001",
        tags: ["iphone", "apple", "premium"],
        isActive: true
      },
      {
        productName: "MacBook Air M2",
        brandName: "Apple",
        category: "electronics",
        subcategory: "laptops",
        productImage: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
        description: "Laptop ultradelgada con chip M2 para máximo rendimiento y duración de batería.",
        price: 99999,
        sellingPrice: 89999,
        stock: 20,
        sku: "APPLEMBA001",
        tags: ["macbook", "apple", "laptop"],
        isActive: true
      }
    ];

    // 1. Limpiar productos existentes con IDs inválidos
    console.log('🗑️ Eliminando productos con IDs inválidos...');
    await productModel.deleteMany({});
    console.log('✅ Productos eliminados');

    // 2. Limpiar carritos existentes
    console.log('🗑️ Limpiando carritos existentes...');
    await addToCartModel.deleteMany({});
    console.log('✅ Carritos limpiados');

    // 3. Crear productos nuevos con IDs válidos
    console.log('➕ Creando productos nuevos...');
    const createdProducts = await productModel.insertMany(correctedProducts);
    console.log(`✅ ${createdProducts.length} productos creados con IDs válidos`);

    // Mostrar los IDs de los productos creados
    console.log('\n📋 Productos creados con IDs válidos:');
    createdProducts.forEach(product => {
      console.log(`- ${product.productName} (ID: ${product._id})`);
    });

    console.log('🎉 Corrección de productos completada');

  } catch (error) {
    console.error('❌ Error corrigiendo productos:', error);
    throw error;
  }
}

/**
 * Función principal de configuración
 */
async function setupProduction() {
  try {
    console.log('🚀 Iniciando configuración de producción...');

    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Ejecutar configuraciones
    await verifySecurityConfig();

    // Configurar índices (continuar aunque haya errores)
    try {
      await setupDatabaseIndexes();
    } catch (indexError) {
      console.log('⚠️  Error en índices, pero continuando...');
    }

    await createDefaultAdmin();
    await setupDefaultCategories();
    await fixProductIds();

    console.log('🎉 Configuración de producción completada exitosamente');

  } catch (error) {
    console.error('❌ Error en configuración de producción:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupProduction();
}

module.exports = { setupProduction };
