const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Script para generar órdenes de muestra
 * Crea órdenes realistas para testing y desarrollo
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

// Importar modelos
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const cartProductModel = require('../models/cartProduct');

/**
 * Generar órdenes de muestra
 */
const generateSampleOrders = async (count = 100) => {
    console.log(`🛒 Generando ${count} órdenes de muestra...`);

    try {
        // Obtener usuarios y productos
        const users = await userModel.find({ role: 'user', isActive: true }).lean();
        const products = await productModel.find({ isActive: true }).lean();

        if (users.length === 0) {
            throw new Error('No hay usuarios disponibles. Ejecuta primero generateSampleUsers.js');
        }

        if (products.length === 0) {
            throw new Error('No hay productos disponibles. Ejecuta primero generateSampleProducts.js');
        }

        console.log(`📊 Usando ${users.length} usuarios y ${products.length} productos`);

        const orders = [];
        const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'stripe'];
        const shippingMethods = ['standard', 'express', 'overnight'];

        // Direcciones de ejemplo
        const sampleAddresses = [
            {
                street: "Calle Gran Vía 123",
                city: "Madrid",
                state: "Madrid",
                zipCode: "28001",
                country: "España"
            },
            {
                street: "Avenida Diagonal 456",
                city: "Barcelona",
                state: "Cataluña",
                zipCode: "08001",
                country: "España"
            },
            {
                street: "Calle Colón 789",
                city: "Valencia",
                state: "Valencia",
                zipCode: "46001",
                country: "España"
            },
            {
                street: "Plaza Nueva 321",
                city: "Sevilla",
                state: "Andalucía",
                zipCode: "41001",
                country: "España"
            },
            {
                street: "Calle Larios 654",
                city: "Málaga",
                state: "Andalucía",
                zipCode: "29001",
                country: "España"
            }
        ];

        for (let i = 0; i < count; i++) {
            // Seleccionar usuario aleatorio
            const user = users[Math.floor(Math.random() * users.length)];
            
            // Seleccionar 1-5 productos aleatorios
            const itemCount = Math.floor(Math.random() * 5) + 1;
            const selectedProducts = [];
            const usedProductIds = new Set();

            for (let j = 0; j < itemCount; j++) {
                let product;
                do {
                    product = products[Math.floor(Math.random() * products.length)];
                } while (usedProductIds.has(product._id.toString()));
                
                usedProductIds.add(product._id.toString());
                selectedProducts.push(product);
            }

            // Crear items de la orden
            const items = selectedProducts.map(product => {
                const quantity = Math.floor(Math.random() * 3) + 1;
                const unitPrice = product.sellingPrice || product.price;
                const totalPrice = unitPrice * quantity;

                return {
                    product: product._id,
                    productName: product.productName,
                    productImage: product.productImage[0] || '',
                    quantity: quantity,
                    unitPrice: unitPrice,
                    totalPrice: totalPrice
                };
            });

            // Calcular totales
            const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
            const shippingCost = subtotal > 100 ? 0 : Math.floor(Math.random() * 20) + 5;
            const tax = subtotal * 0.1; // 10% de impuestos
            const total = subtotal + tax + shippingCost;

            // Seleccionar estado y fechas
            const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
            const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Últimos 90 días
            
            // Calcular fechas basadas en el estado
            let updatedAt = new Date(createdAt);
            let paidAt = null;
            let shippedAt = null;
            let deliveredAt = null;

            if (['confirmed', 'processing', 'shipped', 'delivered'].includes(status)) {
                paidAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);
                updatedAt = paidAt;
            }

            if (['shipped', 'delivered'].includes(status)) {
                shippedAt = new Date(paidAt.getTime() + Math.random() * 72 * 60 * 60 * 1000);
                updatedAt = shippedAt;
            }

            if (status === 'delivered') {
                deliveredAt = new Date(shippedAt.getTime() + Math.random() * 168 * 60 * 60 * 1000);
                updatedAt = deliveredAt;
            }

            // Seleccionar dirección aleatoria
            const shippingAddress = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
            const billingAddress = Math.random() > 0.2 ? shippingAddress : sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];

            const order = {
                customer: {
                    userId: user._id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone || '+1234567890'
                },
                shippingAddress: shippingAddress,
                billingAddress: billingAddress,
                items: items,
                pricing: {
                    subtotal: subtotal,
                    tax: tax,
                    shipping: shippingCost,
                    discount: 0,
                    total: total
                },
                payment: {
                    method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                    status: status === 'pending' ? 'pending' : 'completed',
                    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    paidAt: paidAt
                },
                shipping: {
                    method: shippingMethods[Math.floor(Math.random() * shippingMethods.length)],
                    status: status === 'pending' ? 'pending' : 
                           status === 'confirmed' ? 'processing' :
                           status === 'processing' ? 'processing' :
                           status === 'shipped' ? 'shipped' : 'delivered',
                    trackingNumber: ['shipped', 'delivered'].includes(status) ? 
                        `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : null,
                    carrier: ['shipped', 'delivered'].includes(status) ? 
                        ['FedEx', 'UPS', 'DHL', 'Correos'][Math.floor(Math.random() * 4)] : null,
                    shippedAt: shippedAt,
                    deliveredAt: deliveredAt
                },
                status: status,
                notes: {
                    customer: Math.random() > 0.7 ? "Por favor entregar en horario de oficina" : null
                },
                events: [
                    {
                        status: 'pending',
                        timestamp: createdAt,
                        note: 'Orden creada'
                    }
                ],
                createdAt: createdAt,
                updatedAt: updatedAt
            };

            // Agregar eventos adicionales
            if (paidAt) {
                order.events.push({
                    status: 'confirmed',
                    timestamp: paidAt,
                    note: 'Pago confirmado'
                });
            }

            if (shippedAt) {
                order.events.push({
                    status: 'shipped',
                    timestamp: shippedAt,
                    note: 'Orden enviada'
                });
            }

            if (deliveredAt) {
                order.events.push({
                    status: 'delivered',
                    timestamp: deliveredAt,
                    note: 'Orden entregada'
                });
            }

            orders.push(order);
        }

        // Insertar órdenes
        await orderModel.insertMany(orders);
        console.log(`✅ ${orders.length} órdenes creadas exitosamente`);

        // Mostrar estadísticas
        await showOrderStats();

    } catch (error) {
        console.error('❌ Error generando órdenes:', error);
        throw error;
    }
};

/**
 * Mostrar estadísticas de órdenes
 */
const showOrderStats = async () => {
    console.log('\n📊 Estadísticas de órdenes:');
    
    try {
        const stats = await orderModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$pricing.total' },
                    avgValue: { $avg: '$pricing.total' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} órdenes | Valor total: $${stat.totalValue.toFixed(2)} | Promedio: $${stat.avgValue.toFixed(2)}`);
        });

        const totalOrders = await orderModel.countDocuments();
        const totalRevenue = await orderModel.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);

        const recentOrders = await orderModel.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        console.log(`\n🎯 Total: ${totalOrders} órdenes`);
        console.log(`💰 Ingresos (entregadas): $${totalRevenue[0]?.total.toFixed(2) || 0}`);
        console.log(`📅 Nuevas (7 días): ${recentOrders} órdenes`);

        // Estadísticas por método de pago
        const paymentStats = await orderModel.aggregate([
            {
                $group: {
                    _id: '$payment.method',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$pricing.total' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        console.log('\n💳 Por método de pago:');
        paymentStats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} órdenes | $${stat.totalValue.toFixed(2)}`);
        });

        // Estadísticas por método de envío
        const shippingStats = await orderModel.aggregate([
            {
                $group: {
                    _id: '$shipping.method',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        console.log('\n🚚 Por método de envío:');
        shippingStats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} órdenes`);
        });

    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
    }
};

/**
 * Crear órdenes de prueba específicas
 */
const createTestOrders = async () => {
    console.log('🧪 Creando órdenes de prueba específicas...');

    try {
        const users = await userModel.find({ role: 'user' }).limit(3).lean();
        const products = await productModel.find({}).limit(5).lean();

        if (users.length === 0 || products.length === 0) {
            console.log('⚠️ No hay suficientes usuarios o productos para crear órdenes de prueba');
            return;
        }

        const testOrders = [
            {
                customer: {
                    userId: users[0]._id,
                    email: users[0].email,
                    name: users[0].name,
                    phone: users[0].phone || '+1234567890'
                },
                shippingAddress: {
                    street: "Calle de Prueba 123",
                    city: "Madrid",
                    state: "Madrid",
                    zipCode: "28001",
                    country: "España"
                },
                billingAddress: {
                    street: "Calle de Prueba 123",
                    city: "Madrid",
                    state: "Madrid",
                    zipCode: "28001",
                    country: "España"
                },
                items: [{
                    product: products[0]._id,
                    productName: products[0].productName,
                    productImage: products[0].productImage[0] || '',
                    quantity: 1,
                    unitPrice: products[0].sellingPrice || products[0].price,
                    totalPrice: products[0].sellingPrice || products[0].price
                }],
                pricing: {
                    subtotal: products[0].sellingPrice || products[0].price,
                    tax: (products[0].sellingPrice || products[0].price) * 0.1,
                    shipping: 9.99,
                    discount: 0,
                    total: (products[0].sellingPrice || products[0].price) * 1.1 + 9.99
                },
                payment: {
                    method: 'credit_card',
                    status: 'pending',
                    transactionId: `TEST-TXN-${Date.now()}`
                },
                shipping: {
                    method: 'standard',
                    status: 'pending'
                },
                status: 'pending',
                notes: {
                    customer: 'Esta es una orden de prueba'
                },
                events: [{
                    status: 'pending',
                    timestamp: new Date(),
                    note: 'Orden de prueba creada'
                }]
            }
        ];

        await orderModel.insertMany(testOrders);
        console.log(`✅ ${testOrders.length} órdenes de prueba creadas`);

    } catch (error) {
        console.error('❌ Error creando órdenes de prueba:', error);
    }
};

/**
 * Función principal
 */
const main = async () => {
    console.log('🚀 Iniciando generación de órdenes de muestra...\n');

    try {
        await connectDB();

        // Obtener número de órdenes a generar
        let orderCount = 100;
        const countIndex = process.argv.indexOf('--count');
        if (countIndex !== -1 && process.argv[countIndex + 1]) {
            orderCount = parseInt(process.argv[countIndex + 1]);
        }

        // Limpiar órdenes existentes si se especifica
        if (process.argv.includes('--clean')) {
            await orderModel.deleteMany({});
            console.log('🗑️ Órdenes existentes eliminadas');
        }

        // Generar órdenes
        await generateSampleOrders(orderCount);

        // Crear órdenes de prueba si se especifica
        if (process.argv.includes('--test-orders')) {
            console.log('');
            await createTestOrders();
        }

        console.log('\n🎉 Generación de órdenes completada exitosamente');
        console.log('💡 Ahora tienes datos realistas para probar el sistema de órdenes');

    } catch (error) {
        console.error('❌ Error durante la generación:', error);
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
    generateSampleOrders,
    createTestOrders,
    showOrderStats
};
