const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Script para optimizar la base de datos
 * Crea índices, optimiza consultas y limpia datos
 */

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

// Modelos
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const cartProductModel = require('../models/cartProduct');
const couponModel = require('../models/couponModel');
const wishlistModel = require('../models/wishlistModel');
const reviewModel = require('../models/reviewModel');

/**
 * Crear índices optimizados para mejor rendimiento
 */
const createOptimizedIndexes = async () => {
    console.log('🔧 Creando índices optimizados...');

    try {
        // Índices para usuarios
        await userModel.collection.createIndex({ email: 1 }, { unique: true });
        await userModel.collection.createIndex({ role: 1, isActive: 1 });
        await userModel.collection.createIndex({ createdAt: -1 });
        await userModel.collection.createIndex({ 'address.city': 1, 'address.country': 1 });
        console.log('✅ Índices de usuarios creados');

        // Índices para productos
        await productModel.collection.createIndex({ category: 1, isActive: 1 });
        await productModel.collection.createIndex({ brandName: 1 });
        await productModel.collection.createIndex({ price: 1 });
        await productModel.collection.createIndex({ sellingPrice: 1 });
        await productModel.collection.createIndex({ stock: 1 });
        await productModel.collection.createIndex({ sku: 1 }, { unique: true, sparse: true });
        await productModel.collection.createIndex({ createdAt: -1 });
        await productModel.collection.createIndex({ updatedAt: -1 });
        
        // Índice de texto para búsqueda
        await productModel.collection.createIndex({
            productName: 'text',
            description: 'text',
            brandName: 'text',
            tags: 'text'
        }, {
            weights: {
                productName: 10,
                brandName: 8,
                tags: 5,
                description: 3
            },
            name: 'product_search_index'
        });
        console.log('✅ Índices de productos creados');

        // Índices para órdenes
        await orderModel.collection.createIndex({ orderNumber: 1 }, { unique: true });
        await orderModel.collection.createIndex({ 'customer.userId': 1, createdAt: -1 });
        await orderModel.collection.createIndex({ status: 1, createdAt: -1 });
        await orderModel.collection.createIndex({ 'payment.status': 1 });
        await orderModel.collection.createIndex({ 'shipping.status': 1 });
        await orderModel.collection.createIndex({ createdAt: -1 });
        await orderModel.collection.createIndex({ 'pricing.total': 1 });
        await orderModel.collection.createIndex({ 'items.product': 1 });
        console.log('✅ Índices de órdenes creados');

        // Índices para carrito
        await cartProductModel.collection.createIndex({ userId: 1 });
        await cartProductModel.collection.createIndex({ productId: 1 });
        await cartProductModel.collection.createIndex({ userId: 1, productId: 1 });
        await cartProductModel.collection.createIndex({ createdAt: -1 });
        console.log('✅ Índices de carrito creados');

        // Índices para cupones
        await couponModel.collection.createIndex({ code: 1 }, { unique: true });
        await couponModel.collection.createIndex({ isActive: 1, validFrom: 1, validUntil: 1 });
        await couponModel.collection.createIndex({ applicableCategories: 1 });
        await couponModel.collection.createIndex({ applicableProducts: 1 });
        await couponModel.collection.createIndex({ applicableUsers: 1 });
        await couponModel.collection.createIndex({ createdBy: 1 });
        console.log('✅ Índices de cupones creados');

        // Índices para wishlist
        await wishlistModel.collection.createIndex({ user: 1 });
        await wishlistModel.collection.createIndex({ 'products.product': 1 });
        await wishlistModel.collection.createIndex({ user: 1, 'products.addedAt': -1 });
        console.log('✅ Índices de wishlist creados');

        // Índices para reviews
        await reviewModel.collection.createIndex({ product: 1, status: 1, createdAt: -1 });
        await reviewModel.collection.createIndex({ user: 1, createdAt: -1 });
        await reviewModel.collection.createIndex({ rating: 1, status: 1 });
        await reviewModel.collection.createIndex({ verifiedPurchase: 1, status: 1 });
        await reviewModel.collection.createIndex({ 'helpful.yes': 1 });
        await reviewModel.collection.createIndex({ user: 1, product: 1 }, { unique: true });
        console.log('✅ Índices de reviews creados');

        console.log('🎉 Todos los índices han sido creados exitosamente');

    } catch (error) {
        console.error('❌ Error creando índices:', error);
        throw error;
    }
};

/**
 * Analizar y optimizar consultas lentas
 */
const analyzeSlowQueries = async () => {
    console.log('📊 Analizando consultas lentas...');

    try {
        // Ejecutar explain en consultas comunes
        const userQuery = await userModel.find({ role: 'user', isActive: true }).explain('executionStats');
        console.log('📈 Consulta de usuarios:', {
            executionTime: userQuery.executionStats.executionTimeMillis,
            totalDocsExamined: userQuery.executionStats.totalDocsExamined,
            totalDocsReturned: userQuery.executionStats.totalDocsReturned
        });

        const productQuery = await productModel.find({ category: 'electronics', isActive: true }).explain('executionStats');
        console.log('📈 Consulta de productos:', {
            executionTime: productQuery.executionStats.executionTimeMillis,
            totalDocsExamined: productQuery.executionStats.totalDocsExamined,
            totalDocsReturned: productQuery.executionStats.totalDocsReturned
        });

        const orderQuery = await orderModel.find({ status: 'delivered' }).sort({ createdAt: -1 }).explain('executionStats');
        console.log('📈 Consulta de órdenes:', {
            executionTime: orderQuery.executionStats.executionTimeMillis,
            totalDocsExamined: orderQuery.executionStats.totalDocsExamined,
            totalDocsReturned: orderQuery.executionStats.totalDocsReturned
        });

    } catch (error) {
        console.error('❌ Error analizando consultas:', error);
    }
};

/**
 * Limpiar datos obsoletos
 */
const cleanupOldData = async () => {
    console.log('🧹 Limpiando datos obsoletos...');

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Limpiar carritos abandonados (más de 30 días)
        const abandonedCarts = await cartProductModel.deleteMany({
            updatedAt: { $lt: thirtyDaysAgo }
        });
        console.log(`🗑️ Eliminados ${abandonedCarts.deletedCount} carritos abandonados`);

        // Limpiar cupones expirados
        const expiredCoupons = await couponModel.deleteMany({
            validUntil: { $lt: new Date() },
            isActive: false
        });
        console.log(`🗑️ Eliminados ${expiredCoupons.deletedCount} cupones expirados`);

        // Limpiar reviews pendientes muy antiguas (más de 7 días)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const oldPendingReviews = await reviewModel.deleteMany({
            status: 'pending',
            createdAt: { $lt: sevenDaysAgo }
        });
        console.log(`🗑️ Eliminadas ${oldPendingReviews.deletedCount} reviews pendientes antiguas`);

    } catch (error) {
        console.error('❌ Error limpiando datos:', error);
    }
};

/**
 * Optimizar colecciones
 */
const optimizeCollections = async () => {
    console.log('⚡ Optimizando colecciones...');

    try {
        // Compactar colecciones para liberar espacio
        const collections = [
            userModel.collection,
            productModel.collection,
            orderModel.collection,
            cartProductModel.collection,
            couponModel.collection,
            wishlistModel.collection,
            reviewModel.collection
        ];

        for (const collection of collections) {
            try {
                await collection.createIndex({}, { background: true });
                console.log(`✅ Colección ${collection.collectionName} optimizada`);
            } catch (error) {
                console.log(`⚠️ No se pudo optimizar ${collection.collectionName}:`, error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error optimizando colecciones:', error);
    }
};

/**
 * Generar estadísticas de la base de datos
 */
const generateDatabaseStats = async () => {
    console.log('📊 Generando estadísticas de la base de datos...');

    try {
        const stats = {
            users: await userModel.countDocuments(),
            activeUsers: await userModel.countDocuments({ isActive: true }),
            products: await productModel.countDocuments(),
            activeProducts: await productModel.countDocuments({ isActive: true }),
            orders: await orderModel.countDocuments(),
            pendingOrders: await orderModel.countDocuments({ status: 'pending' }),
            completedOrders: await orderModel.countDocuments({ status: 'delivered' }),
            cartItems: await cartProductModel.countDocuments(),
            coupons: await couponModel.countDocuments(),
            activeCoupons: await couponModel.countDocuments({ isActive: true }),
            wishlists: await wishlistModel.countDocuments(),
            reviews: await reviewModel.countDocuments(),
            approvedReviews: await reviewModel.countDocuments({ status: 'approved' })
        };

        console.log('📈 Estadísticas de la base de datos:');
        console.log(`👥 Usuarios: ${stats.users} (${stats.activeUsers} activos)`);
        console.log(`🛍️ Productos: ${stats.products} (${stats.activeProducts} activos)`);
        console.log(`📦 Órdenes: ${stats.orders} (${stats.pendingOrders} pendientes, ${stats.completedOrders} completadas)`);
        console.log(`🛒 Items en carrito: ${stats.cartItems}`);
        console.log(`🎫 Cupones: ${stats.coupons} (${stats.activeCoupons} activos)`);
        console.log(`❤️ Listas de deseos: ${stats.wishlists}`);
        console.log(`⭐ Reviews: ${stats.reviews} (${stats.approvedReviews} aprobadas)`);

        // Calcular tamaño aproximado de la base de datos
        const dbStats = await mongoose.connection.db.stats();
        const sizeInMB = (dbStats.dataSize / 1024 / 1024).toFixed(2);
        console.log(`💾 Tamaño de la base de datos: ${sizeInMB} MB`);

        return stats;

    } catch (error) {
        console.error('❌ Error generando estadísticas:', error);
        return null;
    }
};

/**
 * Crear datos de ejemplo para testing
 */
const createSampleData = async () => {
    console.log('🎭 Creando datos de ejemplo...');

    try {
        // Verificar si ya existen datos
        const existingProducts = await productModel.countDocuments();
        if (existingProducts > 0) {
            console.log('⚠️ Ya existen productos en la base de datos. Saltando creación de datos de ejemplo.');
            return;
        }

        // Crear usuario administrador por defecto
        const adminExists = await userModel.findOne({ role: 'admin' });
        if (!adminExists) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await userModel.create({
                name: 'Administrador',
                email: 'admin@mitienda.com',
                password: hashedPassword,
                role: 'admin',
                phone: '+1234567890',
                isActive: true
            });
            console.log('✅ Usuario administrador creado (admin@mitienda.com / admin123)');
        }

        // Crear categorías de ejemplo
        const categories = [
            'electronics',
            'clothing',
            'home',
            'sports',
            'books',
            'toys',
            'beauty',
            'automotive'
        ];

        // Crear productos de ejemplo
        const sampleProducts = [
            {
                productName: 'iPhone 14 Pro',
                brandName: 'Apple',
                category: 'electronics',
                subcategory: 'smartphones',
                productImage: ['https://via.placeholder.com/300x300?text=iPhone+14+Pro'],
                description: 'El iPhone más avanzado de Apple con chip A16 Bionic',
                price: 999.99,
                sellingPrice: 899.99,
                stock: 50,
                sku: 'IPH14P-256-BLK',
                tags: ['smartphone', 'apple', 'premium']
            },
            {
                productName: 'Samsung Galaxy S23',
                brandName: 'Samsung',
                category: 'electronics',
                subcategory: 'smartphones',
                productImage: ['https://via.placeholder.com/300x300?text=Galaxy+S23'],
                description: 'Smartphone Android de última generación',
                price: 799.99,
                sellingPrice: 749.99,
                stock: 75,
                sku: 'SGS23-128-BLK',
                tags: ['smartphone', 'samsung', 'android']
            },
            {
                productName: 'MacBook Air M2',
                brandName: 'Apple',
                category: 'electronics',
                subcategory: 'laptops',
                productImage: ['https://via.placeholder.com/300x300?text=MacBook+Air'],
                description: 'Laptop ultradelgada con chip M2',
                price: 1199.99,
                sellingPrice: 1099.99,
                stock: 25,
                sku: 'MBA-M2-256-SLV',
                tags: ['laptop', 'apple', 'macbook']
            }
        ];

        await productModel.insertMany(sampleProducts);
        console.log(`✅ ${sampleProducts.length} productos de ejemplo creados`);

        // Crear cupón de ejemplo
        await couponModel.create({
            code: 'WELCOME10',
            name: 'Descuento de Bienvenida',
            description: '10% de descuento en tu primera compra',
            discountType: 'percentage',
            discountValue: 10,
            minimumAmount: 50,
            usageLimit: 1000,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
            isActive: true,
            applicableCategories: ['electronics'],
            createdBy: adminExists?._id || (await userModel.findOne({ role: 'admin' }))._id
        });
        console.log('✅ Cupón de ejemplo creado (WELCOME10)');

    } catch (error) {
        console.error('❌ Error creando datos de ejemplo:', error);
    }
};

/**
 * Función principal
 */
const main = async () => {
    console.log('🚀 Iniciando optimización de la base de datos...\n');

    try {
        await connectDB();

        // Ejecutar optimizaciones
        await createOptimizedIndexes();
        console.log('');
        
        await analyzeSlowQueries();
        console.log('');
        
        await cleanupOldData();
        console.log('');
        
        await optimizeCollections();
        console.log('');
        
        await generateDatabaseStats();
        console.log('');

        // Solo crear datos de ejemplo si se especifica
        if (process.argv.includes('--sample-data')) {
            await createSampleData();
            console.log('');
        }

        console.log('✅ Optimización de la base de datos completada exitosamente');
        console.log('🎉 La base de datos está lista para producción');

    } catch (error) {
        console.error('❌ Error durante la optimización:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('📝 Conexión a la base de datos cerrada');
    }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = {
    createOptimizedIndexes,
    analyzeSlowQueries,
    cleanupOldData,
    optimizeCollections,
    generateDatabaseStats,
    createSampleData
};
