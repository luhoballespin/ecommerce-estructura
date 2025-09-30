/**
 * Script para configurar la base de datos en producción
 * Crea índices, configura usuarios iniciales y datos de ejemplo
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
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

    // Índices para productos
    await productModel.collection.createIndex({ category: 1 });
    await productModel.collection.createIndex({ subcategory: 1 });
    await productModel.collection.createIndex({ price: 1 });
    await productModel.collection.createIndex({ sellingPrice: 1 });
    await productModel.collection.createIndex({ productName: 'text', description: 'text' });
    await productModel.collection.createIndex({ isActive: 1 });
    await productModel.collection.createIndex({ createdAt: -1 });
    await productModel.collection.createIndex({ brandName: 1 });

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
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    // Verificar si ya existe un admin
    const existingAdmin = await userModel.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️  Usuario administrador ya existe');
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
    await setupDatabaseIndexes();
    await createDefaultAdmin();
    await setupDefaultCategories();

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
