/**
 * Script para corregir los IDs de productos en la base de datos
 * Elimina productos con IDs inválidos y regenera datos de muestra
 */

const mongoose = require('mongoose');
const productModel = require('../models/productModel');
const addToCartModel = require('../models/cartProduct');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Datos de productos corregidos
const correctedProducts = [
  {
    productName: "Samsung Galaxy S24 Ultra",
    brandName: "Samsung",
    category: "electronics",
    subcategory: "smartphones",
    productImage: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"],
    description: "Smartphone premium con S Pen y cámara de 200MP para fotografía profesional. Pantalla Dynamic AMOLED 2X de 6.8 pulgadas.",
    price: 119999,
    sellingPrice: 109999,
    stock: 50,
    sku: "SAMS24U001",
    tags: ["smartphone", "samsung", "premium", "camara"],
    isActive: true
  },
  {
    productName: "AirPods Pro 2da Gen",
    brandName: "Apple",
    category: "electronics",
    subcategory: "audio",
    productImage: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500"],
    description: "Auriculares inalámbricos con cancelación activa de ruido y audio espacial. Resistencia al agua IPX4.",
    price: 27999,
    sellingPrice: 24999,
    stock: 30,
    sku: "APPLEAP001",
    tags: ["airpods", "apple", "inalambrico", "audio"],
    isActive: true
  },
  {
    productName: "MacBook Pro 14\"",
    brandName: "Apple",
    category: "electronics",
    subcategory: "laptops",
    productImage: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
    description: "Laptop profesional con chip M2 Pro, pantalla Liquid Retina XDR de 14.2 pulgadas y hasta 18 horas de batería.",
    price: 299999,
    sellingPrice: 279999,
    stock: 15,
    sku: "APPLEMB001",
    tags: ["macbook", "apple", "laptop", "profesional"],
    isActive: true
  },
  {
    productName: "PlayStation 5",
    brandName: "Sony",
    category: "electronics",
    subcategory: "gaming",
    productImage: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500"],
    description: "Consola de videojuegos de nueva generación con SSD ultra rápido y ray tracing en tiempo real.",
    price: 149999,
    sellingPrice: 139999,
    stock: 20,
    sku: "SONYPS5001",
    tags: ["playstation", "sony", "gaming", "consola"],
    isActive: true
  },
  {
    productName: "Nike Air Max 270",
    brandName: "Nike",
    category: "clothing",
    subcategory: "shoes",
    productImage: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
    description: "Zapatillas deportivas con tecnología Air Max y diseño moderno. Perfectas para running y uso diario.",
    price: 25999,
    sellingPrice: 22999,
    stock: 40,
    sku: "NIKEAM001",
    tags: ["nike", "zapatillas", "deportivo", "air-max"],
    isActive: true
  }
];

// Función principal
const fixProductIds = async () => {
  try {
    console.log('🔧 Iniciando corrección de IDs de productos...');

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
    console.log(`✅ ${createdProducts.length} productos creados`);

    // 4. Mostrar los IDs de los productos creados
    console.log('\n📋 Productos creados:');
    createdProducts.forEach(product => {
      console.log(`- ${product.productName} (ID: ${product._id})`);
    });

    console.log('\n🎉 Corrección completada exitosamente!');
    console.log('💡 Ahora puedes usar el carrito sin problemas');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  connectDB().then(() => fixProductIds());
}

module.exports = { fixProductIds };
