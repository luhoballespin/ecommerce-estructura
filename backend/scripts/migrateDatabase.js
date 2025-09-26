const mongoose = require('mongoose');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const APP_CONFIG = require('../config/appConfig');

// Script de migración para actualizar la base de datos con la nueva estructura
async function migrateDatabase() {
  try {
    console.log('🔄 Iniciando migración de la base de datos...');
    
    // Conectar a la base de datos
    await mongoose.connect(APP_CONFIG.database.url, APP_CONFIG.database.options);
    console.log('✅ Conectado a la base de datos');

    // Migrar productos existentes
    await migrateProducts();
    
    // Migrar usuarios existentes
    await migrateUsers();
    
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

async function migrateProducts() {
  console.log('🔄 Migrando productos...');
  
  const products = await productModel.find({});
  let updatedCount = 0;

  for (const product of products) {
    const updates = {};
    
    // Agregar campos faltantes con valores por defecto
    if (!product.stock) updates.stock = 0;
    if (!product.isActive) updates.isActive = true;
    if (!product.tags) updates.tags = [];
    if (!product.features) updates.features = [];
    
    // Generar SKU si no existe
    if (!product.sku) {
      updates.sku = `SKU-${product._id.toString().slice(-8).toUpperCase()}`;
    }
    
    // Actualizar el producto si hay cambios
    if (Object.keys(updates).length > 0) {
      await productModel.findByIdAndUpdate(product._id, updates);
      updatedCount++;
    }
  }
  
  console.log(`✅ ${updatedCount} productos actualizados`);
}

async function migrateUsers() {
  console.log('🔄 Migrando usuarios...');
  
  const users = await userModel.find({});
  let updatedCount = 0;

  for (const user of users) {
    const updates = {};
    
    // Agregar campos faltantes con valores por defecto
    if (!user.isActive) updates.isActive = true;
    if (!user.preferences) {
      updates.preferences = {
        currency: 'USD',
        language: 'es',
        notifications: {
          email: true,
          sms: false
        }
      };
    }
    
    // Actualizar el usuario si hay cambios
    if (Object.keys(updates).length > 0) {
      await userModel.findByIdAndUpdate(user._id, updates);
      updatedCount++;
    }
  }
  
  console.log(`✅ ${updatedCount} usuarios actualizados`);
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };
