const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Script para generar productos de muestra realistas
 * Crea productos diversos para diferentes categorías de comercio
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

// Importar modelo de productos
const productModel = require('../models/productModel');

// Datos de productos de muestra por categoría
const sampleProducts = {
    electronics: [
        {
            productName: "iPhone 15 Pro Max",
            brandName: "Apple",
            category: "electronics",
            subcategory: "smartphones",
            productImage: [
                "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
            ],
            description: "El iPhone más avanzado con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7 pulgadas. Incluye Dynamic Island y resistencia al agua IP68.",
            price: 1199.99,
            sellingPrice: 1099.99,
            stock: Math.floor(Math.random() * 100) + 10,
            sku: "IPH15PM-256-BLK",
            tags: ["smartphone", "apple", "premium", "5g", "pro"],
            features: [
                { name: "Pantalla", value: "6.7 pulgadas Super Retina XDR" },
                { name: "Cámara", value: "48MP ProRAW" },
                { name: "Procesador", value: "A17 Pro" },
                { name: "Almacenamiento", value: "256GB" },
                { name: "Resistencia", value: "IP68" }
            ]
        },
        {
            productName: "Samsung Galaxy S24 Ultra",
            brandName: "Samsung",
            category: "electronics",
            subcategory: "smartphones",
            productImage: [
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
                "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500"
            ],
            description: "Smartphone Android de gama alta con S Pen, cámara de 200MP y pantalla Dynamic AMOLED 2X de 6.8 pulgadas. Potencia y creatividad en un solo dispositivo.",
            price: 1299.99,
            sellingPrice: 1199.99,
            stock: Math.floor(Math.random() * 80) + 15,
            sku: "SGS24U-512-TIT",
            tags: ["smartphone", "samsung", "android", "s-pen", "camera"],
            features: [
                { name: "Pantalla", value: "6.8 pulgadas Dynamic AMOLED 2X" },
                { name: "Cámara", value: "200MP con zoom óptico 10x" },
                { name: "S Pen", value: "Incluido" },
                { name: "Almacenamiento", value: "512GB" },
                { name: "Batería", value: "5000mAh" }
            ]
        },
        {
            productName: "MacBook Pro 14\" M3",
            brandName: "Apple",
            category: "electronics",
            subcategory: "laptops",
            productImage: [
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"
            ],
            description: "Laptop profesional con chip M3, pantalla Liquid Retina XDR de 14.2 pulgadas y hasta 22 horas de duración de batería. Perfecta para creativos y desarrolladores.",
            price: 1999.99,
            sellingPrice: 1799.99,
            stock: Math.floor(Math.random() * 50) + 5,
            sku: "MBP14-M3-512-SLV",
            tags: ["laptop", "apple", "macbook", "professional", "m3"],
            features: [
                { name: "Pantalla", value: "14.2 pulgadas Liquid Retina XDR" },
                { name: "Procesador", value: "Apple M3" },
                { name: "RAM", value: "8GB unificada" },
                { name: "Almacenamiento", value: "512GB SSD" },
                { name: "Batería", value: "Hasta 22 horas" }
            ]
        },
        {
            productName: "Sony WH-1000XM5",
            brandName: "Sony",
            category: "electronics",
            subcategory: "audio",
            productImage: [
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
            ],
            description: "Auriculares inalámbricos premium con cancelación de ruido líder en la industria y sonido de alta fidelidad. Perfectos para música y trabajo.",
            price: 399.99,
            sellingPrice: 349.99,
            stock: Math.floor(Math.random() * 60) + 20,
            sku: "SONY-WH1000XM5-BLK",
            tags: ["headphones", "wireless", "noise-canceling", "premium", "sony"],
            features: [
                { name: "Cancelación de ruido", value: "Industry-leading" },
                { name: "Batería", value: "30 horas de duración" },
                { name: "Carga rápida", value: "3 minutos = 3 horas" },
                { name: "Conectividad", value: "Bluetooth 5.2" },
                { name: "Peso", value: "250g" }
            ]
        }
    ],
    
    clothing: [
        {
            productName: "Camiseta Premium Algodón",
            brandName: "FashionCo",
            category: "clothing",
            subcategory: "shirts",
            productImage: [
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500"
            ],
            description: "Camiseta de algodón 100% orgánico, suave y cómoda. Corte moderno y duradero. Disponible en múltiples colores y tallas.",
            price: 29.99,
            sellingPrice: 24.99,
            stock: Math.floor(Math.random() * 200) + 50,
            sku: "TSH-COT-ORG-BLK",
            tags: ["camiseta", "algodón", "orgánico", "básico", "unisex"],
            features: [
                { name: "Material", value: "100% Algodón Orgánico" },
                { name: "Cuidado", value: "Lavable en máquina" },
                { name: "Origen", value: "Comercio Justo" },
                { name: "Tallas", value: "XS a XXL" },
                { name: "Colores", value: "8 opciones disponibles" }
            ]
        },
        {
            productName: "Jeans Slim Fit Premium",
            brandName: "DenimCo",
            category: "clothing",
            subcategory: "pants",
            productImage: [
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
                "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500"
            ],
            description: "Jeans de corte slim fit con tecnología stretch para máxima comodidad. Hechos con mezclilla premium y acabados de alta calidad.",
            price: 89.99,
            sellingPrice: 79.99,
            stock: Math.floor(Math.random() * 150) + 30,
            sku: "JNS-SLIM-IND-32",
            tags: ["jeans", "slim-fit", "stretch", "premium", "casual"],
            features: [
                { name: "Corte", value: "Slim Fit" },
                { name: "Material", value: "98% Algodón, 2% Elastano" },
                { name: "Lavado", value: "Vintage Indigo" },
                { name: "Tallas", value: "28-40" },
                { name: "Largo", value: "Regular y Alto" }
            ]
        },
        {
            productName: "Chaqueta Deportiva Nike",
            brandName: "Nike",
            category: "clothing",
            subcategory: "jackets",
            productImage: [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500"
            ],
            description: "Chaqueta deportiva ligera y transpirable, perfecta para actividades al aire libre. Tecnología Dri-FIT para mantenerte seco y cómodo.",
            price: 79.99,
            sellingPrice: 69.99,
            stock: Math.floor(Math.random() * 100) + 25,
            sku: "NK-JKT-SPT-BLK-M",
            tags: ["chaqueta", "deportiva", "nike", "transpirable", "outdoor"],
            features: [
                { name: "Tecnología", value: "Dri-FIT" },
                { name: "Peso", value: "Ligera" },
                { name: "Capucha", value: "Ajustable" },
                { name: "Bolsillos", value: "2 frontales con cremallera" },
                { name: "Cuidado", value: "Lavable en máquina" }
            ]
        }
    ],

    home: [
        {
            productName: "Set de Sábanas Premium 4 Piezas",
            brandName: "HomeLux",
            category: "home",
            subcategory: "bedding",
            productImage: [
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500"
            ],
            description: "Set de sábanas de algodón egipcio 600 hilos, ultra suave y duradero. Incluye sábana bajera, encimera y 2 fundas de almohada.",
            price: 149.99,
            sellingPrice: 129.99,
            stock: Math.floor(Math.random() * 80) + 20,
            sku: "ST-SHT-EGY-600-KG",
            tags: ["sábanas", "algodón", "egipcio", "premium", "cama"],
            features: [
                { name: "Material", value: "100% Algodón Egipcio" },
                { name: "Hilos", value: "600 por pulgada cuadrada" },
                { name: "Tamaño", value: "King Size" },
                { name: "Incluye", value: "4 piezas completas" },
                { name: "Cuidado", value: "Lavable en máquina" }
            ]
        },
        {
            productName: "Lámpara LED Inteligente",
            brandName: "SmartHome",
            category: "home",
            subcategory: "lighting",
            productImage: [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500"
            ],
            description: "Lámpara LED inteligente con control por app, 16 millones de colores y sincronización con música. Compatible con Alexa y Google Assistant.",
            price: 59.99,
            sellingPrice: 49.99,
            stock: Math.floor(Math.random() * 120) + 40,
            sku: "LMP-LED-SMART-RGB",
            tags: ["lámpara", "led", "inteligente", "rgb", "wifi"],
            features: [
                { name: "Colores", value: "16 millones" },
                { name: "Control", value: "App móvil" },
                { name: "Asistentes", value: "Alexa, Google Assistant" },
                { name: "Potencia", value: "9W LED" },
                { name: "Vida útil", value: "25,000 horas" }
            ]
        },
        {
            productName: "Juego de Ollas Antiadherentes",
            brandName: "KitchenPro",
            category: "home",
            subcategory: "kitchen",
            productImage: [
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
                "https://images.unsplash.com/photo-1556909114-23d4e9c5e8a9?w=500"
            ],
            description: "Set de 7 piezas de ollas antiadherentes con revestimiento cerámico. Incluye diferentes tamaños para todas las necesidades culinarias.",
            price: 199.99,
            sellingPrice: 179.99,
            stock: Math.floor(Math.random() * 60) + 15,
            sku: "ST-OLS-ANTI-7PCS",
            tags: ["ollas", "antiadherente", "cerámico", "cocina", "set"],
            features: [
                { name: "Piezas", value: "7 ollas diferentes" },
                { name: "Material", value: "Aluminio con revestimiento cerámico" },
                { name: "Asas", value: "Ergonómicas y resistentes al calor" },
                { name: "Compatibilidad", value: "Todas las cocinas" },
                { name: "Garantía", value: "2 años" }
            ]
        }
    ],

    sports: [
        {
            productName: "Zapatillas Running Nike Air Max",
            brandName: "Nike",
            category: "sports",
            subcategory: "footwear",
            productImage: [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500"
            ],
            description: "Zapatillas de running con tecnología Air Max para máxima amortiguación y comodidad. Perfectas para corredores de largas distancias.",
            price: 129.99,
            sellingPrice: 119.99,
            stock: Math.floor(Math.random() * 100) + 30,
            sku: "NK-RUN-AIRMAX-270",
            tags: ["zapatillas", "running", "nike", "air-max", "deporte"],
            features: [
                { name: "Tecnología", value: "Air Max 270" },
                { name: "Suela", value: "React foam" },
                { name: "Peso", value: "310g (talla 42)" },
                { name: "Drop", value: "8mm" },
                { name: "Superficie", value: "Asfalto y pista" }
            ]
        },
        {
            productName: "Mancuernas Ajustables 20kg",
            brandName: "FitPro",
            category: "sports",
            subcategory: "fitness",
            productImage: [
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
                "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500"
            ],
            description: "Mancuernas ajustables de 2x20kg con sistema de cambio rápido. Perfectas para entrenamiento en casa o gimnasio.",
            price: 299.99,
            sellingPrice: 249.99,
            stock: Math.floor(Math.random() * 40) + 10,
            sku: "MNC-AJST-2X20KG",
            tags: ["mancuernas", "ajustables", "fitness", "gimnasio", "casa"],
            features: [
                { name: "Peso total", value: "40kg (2x20kg)" },
                { name: "Sistema", value: "Cambio rápido" },
                { name: "Material", value: "Acero cromado" },
                { name: "Agarre", value: "Ergonómico" },
                { name: "Incluye", value: "Estuche de transporte" }
            ]
        },
        {
            productName: "Bicicleta de Montaña 27.5\"",
            brandName: "MountainBike",
            category: "sports",
            subcategory: "cycling",
            productImage: [
                "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
                "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500"
            ],
            description: "Bicicleta de montaña con cuadro de aluminio, frenos de disco hidráulicos y suspensión delantera. Ideal para senderos y montaña.",
            price: 899.99,
            sellingPrice: 799.99,
            stock: Math.floor(Math.random() * 30) + 5,
            sku: "BIC-MTB-275-ALM",
            tags: ["bicicleta", "montaña", "mtb", "suspensión", "aluminio"],
            features: [
                { name: "Cuadro", value: "Aluminio 6061" },
                { name: "Ruedas", value: "27.5 pulgadas" },
                { name: "Frenos", value: "Disco hidráulico" },
                { name: "Suspensión", value: "Delantera 100mm" },
                { name: "Velocidades", value: "21 velocidades" }
            ]
        }
    ],

    books: [
        {
            productName: "El Arte de la Guerra",
            brandName: "Sun Tzu",
            category: "books",
            subcategory: "business",
            productImage: [
                "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"
            ],
            description: "Tratado militar clásico que ha influido en estrategias de negocio modernas. Edición comentada con análisis contemporáneo.",
            price: 19.99,
            sellingPrice: 16.99,
            stock: Math.floor(Math.random() * 100) + 50,
            sku: "BK-ART-WAR-SUN",
            tags: ["libro", "estrategia", "negocios", "clásico", "filosofía"],
            features: [
                { name: "Autor", value: "Sun Tzu" },
                { name: "Páginas", value: "256" },
                { name: "Formato", value: "Tapa blanda" },
                { name: "Idioma", value: "Español" },
                { name: "Editorial", value: "Clásicos Modernos" }
            ]
        },
        {
            productName: "JavaScript: La Guía Definitiva",
            brandName: "David Flanagan",
            category: "books",
            subcategory: "programming",
            productImage: [
                "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"
            ],
            description: "La guía más completa de JavaScript. Desde conceptos básicos hasta técnicas avanzadas de programación web moderna.",
            price: 79.99,
            sellingPrice: 69.99,
            stock: Math.floor(Math.random() * 80) + 20,
            sku: "BK-JS-GUIDE-FLAN",
            tags: ["javascript", "programación", "web", "desarrollo", "técnico"],
            features: [
                { name: "Autor", value: "David Flanagan" },
                { name: "Páginas", value: "1096" },
                { name: "Edición", value: "7ma Edición" },
                { name: "Nivel", value: "Intermedio-Avanzado" },
                { name: "Actualización", value: "ES2023" }
            ]
        }
    ],

    toys: [
        {
            productName: "Lego Creator Set Casa Modular",
            brandName: "LEGO",
            category: "toys",
            subcategory: "building",
            productImage: [
                "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
                "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500"
            ],
            description: "Set de construcción LEGO Creator con 1500+ piezas. Construye una casa modular detallada con muebles y accesorios.",
            price: 149.99,
            sellingPrice: 129.99,
            stock: Math.floor(Math.random() * 60) + 15,
            sku: "LEGO-CREATOR-HOUSE",
            tags: ["lego", "construcción", "creativo", "casa", "modular"],
            features: [
                { name: "Piezas", value: "1500+" },
                { name: "Edad", value: "12+" },
                { name: "Tema", value: "Creator" },
                { name: "Incluye", value: "Minifiguras" },
                { name: "Manual", value: "Instrucciones detalladas" }
            ]
        },
        {
            productName: "Puzzle 1000 Piezas Paisaje",
            brandName: "PuzzleMaster",
            category: "toys",
            subcategory: "puzzles",
            productImage: [
                "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
                "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500"
            ],
            description: "Puzzle de 1000 piezas con un hermoso paisaje de montaña al atardecer. Piezas de cartón resistente y acabado mate.",
            price: 24.99,
            sellingPrice: 19.99,
            stock: Math.floor(Math.random() * 80) + 30,
            sku: "PUZ-1000-MOUNTAIN",
            tags: ["puzzle", "1000-piezas", "paisaje", "montaña", "relajante"],
            features: [
                { name: "Piezas", value: "1000" },
                { name: "Tamaño", value: "70x50 cm" },
                { name: "Material", value: "Cartón resistente" },
                { name: "Acabado", value: "Mate anti-reflejo" },
                { name: "Dificultad", value: "Intermedio" }
            ]
        }
    ]
};

/**
 * Función para generar productos aleatorios
 */
const generateRandomProducts = async () => {
    console.log('🎲 Generando productos de muestra aleatorios...');

    try {
        // Limpiar productos existentes si se especifica
        if (process.argv.includes('--clean')) {
            await productModel.deleteMany({});
            console.log('🗑️ Productos existentes eliminados');
        }

        const allProducts = [];
        let totalCreated = 0;

        // Procesar cada categoría
        for (const [category, products] of Object.entries(sampleProducts)) {
            console.log(`📦 Procesando categoría: ${category}`);
            
            for (const product of products) {
                // Crear variaciones del producto
                const variations = createProductVariations(product);
                allProducts.push(...variations);
                totalCreated += variations.length;
            }
        }

        // Insertar todos los productos
        await productModel.insertMany(allProducts);
        
        console.log(`✅ ${totalCreated} productos creados exitosamente`);
        
        // Mostrar estadísticas
        await showProductStats();

    } catch (error) {
        console.error('❌ Error generando productos:', error);
        throw error;
    }
};

/**
 * Crear variaciones de un producto (colores, tallas, etc.)
 */
const createProductVariations = (baseProduct) => {
    const variations = [];
    
    // Variaciones por categoría
    switch (baseProduct.category) {
        case 'electronics':
            // Para electrónicos, crear variaciones de color y almacenamiento
            const colors = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Gris'];
            const storage = ['128GB', '256GB', '512GB', '1TB'];
            
            colors.forEach((color, colorIndex) => {
                storage.forEach((storageSize, storageIndex) => {
                    const variation = {
                        ...baseProduct,
                        productName: `${baseProduct.productName} ${color} ${storageSize}`,
                        sku: `${baseProduct.sku}-${color.substring(0, 3).toUpperCase()}-${storageSize}`,
                        price: baseProduct.price + (storageIndex * 100),
                        sellingPrice: baseProduct.sellingPrice + (storageIndex * 100),
                        stock: Math.floor(Math.random() * 50) + 5,
                        tags: [...baseProduct.tags, color.toLowerCase()],
                        features: baseProduct.features.map(feature => 
                            feature.name === 'Almacenamiento' 
                                ? { ...feature, value: storageSize }
                                : feature
                        )
                    };
                    variations.push(variation);
                });
            });
            break;

        case 'clothing':
            // Para ropa, crear variaciones de color y talla
            const clothingColors = ['Negro', 'Blanco', 'Azul', 'Gris', 'Rojo'];
            const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            
            clothingColors.forEach(color => {
                sizes.forEach(size => {
                    const variation = {
                        ...baseProduct,
                        productName: `${baseProduct.productName} ${color} Talla ${size}`,
                        sku: `${baseProduct.sku}-${color.substring(0, 3).toUpperCase()}-${size}`,
                        stock: Math.floor(Math.random() * 30) + 5,
                        tags: [...baseProduct.tags, color.toLowerCase(), size.toLowerCase()]
                    };
                    variations.push(variation);
                });
            });
            break;

        case 'books':
            // Para libros, crear variaciones de idioma y formato
            const languages = ['Español', 'Inglés', 'Francés'];
            const formats = ['Tapa Blanda', 'Tapa Dura', 'Digital'];
            
            languages.forEach(lang => {
                formats.forEach(format => {
                    const variation = {
                        ...baseProduct,
                        productName: `${baseProduct.productName} - ${lang} (${format})`,
                        sku: `${baseProduct.sku}-${lang.substring(0, 3).toUpperCase()}-${format.substring(0, 3).toUpperCase()}`,
                        price: format === 'Tapa Dura' ? baseProduct.price + 10 : 
                               format === 'Digital' ? baseProduct.price - 5 : baseProduct.price,
                        sellingPrice: format === 'Tapa Dura' ? baseProduct.sellingPrice + 10 : 
                                    format === 'Digital' ? baseProduct.sellingPrice - 5 : baseProduct.sellingPrice,
                        stock: Math.floor(Math.random() * 40) + 10,
                        tags: [...baseProduct.tags, lang.toLowerCase(), format.toLowerCase()]
                    };
                    variations.push(variation);
                });
            });
            break;

        default:
            // Para otras categorías, crear solo algunas variaciones básicas
            const basicVariations = ['Estándar', 'Premium', 'Deluxe'];
            basicVariations.forEach((variation, index) => {
                const productVariation = {
                    ...baseProduct,
                    productName: `${baseProduct.productName} - ${variation}`,
                    sku: `${baseProduct.sku}-${variation.substring(0, 3).toUpperCase()}`,
                    price: baseProduct.price + (index * 20),
                    sellingPrice: baseProduct.sellingPrice + (index * 20),
                    stock: Math.floor(Math.random() * 40) + 10,
                    tags: [...baseProduct.tags, variation.toLowerCase()]
                };
                variations.push(productVariation);
            });
    }

    return variations;
};

/**
 * Mostrar estadísticas de productos creados
 */
const showProductStats = async () => {
    console.log('\n📊 Estadísticas de productos:');
    
    try {
        const stats = await productModel.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$sellingPrice' },
                    totalStock: { $sum: '$stock' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} productos | Precio promedio: $${stat.avgPrice.toFixed(2)} | Stock total: ${stat.totalStock}`);
        });

        const totalProducts = await productModel.countDocuments();
        const totalStock = await productModel.aggregate([
            { $group: { _id: null, total: { $sum: '$stock' } } }
        ]);

        console.log(`\n🎯 Total: ${totalProducts} productos únicos`);
        console.log(`📦 Stock total: ${totalStock[0]?.total || 0} unidades`);

    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
    }
};

/**
 * Crear productos de ejemplo específicos para testing
 */
const createTestProducts = async () => {
    console.log('🧪 Creando productos de prueba específicos...');

    const testProducts = [
        {
            productName: "Producto de Prueba - Sin Stock",
            brandName: "TestBrand",
            category: "electronics",
            subcategory: "testing",
            productImage: ["https://via.placeholder.com/300x300?text=Sin+Stock"],
            description: "Producto para probar manejo de stock agotado",
            price: 99.99,
            sellingPrice: 89.99,
            stock: 0,
            sku: "TEST-NO-STOCK",
            tags: ["test", "sin-stock"],
            isActive: true
        },
        {
            productName: "Producto de Prueba - Precio Alto",
            brandName: "TestBrand",
            category: "electronics",
            subcategory: "testing",
            productImage: ["https://via.placeholder.com/300x300?text=Precio+Alto"],
            description: "Producto para probar filtros de precio alto",
            price: 9999.99,
            sellingPrice: 8999.99,
            stock: 5,
            sku: "TEST-HIGH-PRICE",
            tags: ["test", "precio-alto"],
            isActive: true
        },
        {
            productName: "Producto Inactivo",
            brandName: "TestBrand",
            category: "electronics",
            subcategory: "testing",
            productImage: ["https://via.placeholder.com/300x300?text=Inactivo"],
            description: "Producto inactivo para pruebas",
            price: 49.99,
            sellingPrice: 39.99,
            stock: 10,
            sku: "TEST-INACTIVE",
            tags: ["test", "inactivo"],
            isActive: false
        }
    ];

    await productModel.insertMany(testProducts);
    console.log(`✅ ${testProducts.length} productos de prueba creados`);
};

/**
 * Función principal
 */
const main = async () => {
    console.log('🚀 Iniciando generación de productos de muestra...\n');

    try {
        await connectDB();

        // Generar productos aleatorios
        await generateRandomProducts();

        // Crear productos de prueba si se especifica
        if (process.argv.includes('--test-products')) {
            console.log('');
            await createTestProducts();
        }

        console.log('\n🎉 Generación de productos completada exitosamente');
        console.log('💡 Tu tienda ahora tiene productos diversos para maquetar perfectamente');

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
    generateRandomProducts,
    createTestProducts,
    showProductStats
};
