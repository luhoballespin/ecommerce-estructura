const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * Script para generar usuarios de muestra
 * Crea usuarios realistas para testing y desarrollo
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

// Importar modelo de usuarios
const userModel = require('../models/userModel');

// Datos de usuarios de muestra
const sampleUsers = [
    // Administradores
    {
        name: "Ana García",
        email: "admin@mitienda.com",
        password: "admin123",
        role: "admin",
        phone: "+1234567890",
        address: {
            street: "Calle Principal 123",
            city: "Madrid",
            state: "Madrid",
            zipCode: "28001",
            country: "España"
        },
        preferences: {
            currency: "EUR",
            language: "es",
            notifications: {
                email: true,
                sms: false
            }
        }
    },
    {
        name: "Carlos López",
        email: "moderator@mitienda.com",
        password: "moderator123",
        role: "moderator",
        phone: "+1234567891",
        address: {
            street: "Avenida Libertad 456",
            city: "Barcelona",
            state: "Cataluña",
            zipCode: "08001",
            country: "España"
        }
    },

    // Vendedores
    {
        name: "María Rodríguez",
        email: "seller1@mitienda.com",
        password: "seller123",
        role: "seller",
        phone: "+1234567892",
        address: {
            street: "Plaza Mayor 789",
            city: "Valencia",
            state: "Valencia",
            zipCode: "46001",
            country: "España"
        }
    },
    {
        name: "José Martínez",
        email: "seller2@mitienda.com",
        password: "seller123",
        role: "seller",
        phone: "+1234567893",
        address: {
            street: "Calle Comercio 321",
            city: "Sevilla",
            state: "Andalucía",
            zipCode: "41001",
            country: "España"
        }
    },

    // Usuarios normales
    {
        name: "Laura Fernández",
        email: "laura.fernandez@email.com",
        password: "user123",
        role: "user",
        phone: "+1234567894",
        address: {
            street: "Calle Rosa 654",
            city: "Bilbao",
            state: "País Vasco",
            zipCode: "48001",
            country: "España"
        },
        preferences: {
            currency: "EUR",
            language: "es",
            notifications: {
                email: true,
                sms: true
            }
        }
    },
    {
        name: "David Sánchez",
        email: "david.sanchez@email.com",
        password: "user123",
        role: "user",
        phone: "+1234567895",
        address: {
            street: "Avenida del Mar 987",
            city: "Málaga",
            state: "Andalucía",
            zipCode: "29001",
            country: "España"
        }
    },
    {
        name: "Carmen Ruiz",
        email: "carmen.ruiz@email.com",
        password: "user123",
        role: "user",
        phone: "+1234567896",
        address: {
            street: "Calle Luna 147",
            city: "Granada",
            state: "Andalucía",
            zipCode: "18001",
            country: "España"
        }
    },
    {
        name: "Antonio González",
        email: "antonio.gonzalez@email.com",
        password: "user123",
        role: "user",
        phone: "+1234567897",
        address: {
            street: "Plaza del Sol 258",
            city: "Córdoba",
            state: "Andalucía",
            zipCode: "14001",
            country: "España"
        }
    },
    {
        name: "Isabel Moreno",
        email: "isabel.moreno@email.com",
        password: "user123",
        role: "user",
        phone: "+1234567898",
        address: {
            street: "Calle Estrella 369",
            city: "Murcia",
            state: "Murcia",
            zipCode: "30001",
            country: "España"
        }
    },
    {
        name: "Francisco Jiménez",
        email: "francisco.jimenez@email.com",
        password: "user123",
        role: "user",
        phone: "+1234567899",
        address: {
            street: "Avenida Central 741",
            city: "Zaragoza",
            state: "Aragón",
            zipCode: "50001",
            country: "España"
        }
    },

    // Usuarios internacionales
    {
        name: "John Smith",
        email: "john.smith@email.com",
        password: "user123",
        role: "user",
        phone: "+1987654321",
        address: {
            street: "Main Street 123",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA"
        },
        preferences: {
            currency: "USD",
            language: "en",
            notifications: {
                email: true,
                sms: false
            }
        }
    },
    {
        name: "Marie Dubois",
        email: "marie.dubois@email.com",
        password: "user123",
        role: "user",
        phone: "+33123456789",
        address: {
            street: "Rue de la Paix 456",
            city: "Paris",
            state: "Île-de-France",
            zipCode: "75001",
            country: "Francia"
        },
        preferences: {
            currency: "EUR",
            language: "fr",
            notifications: {
                email: true,
                sms: false
            }
        }
    },
    {
        name: "Giuseppe Rossi",
        email: "giuseppe.rossi@email.com",
        password: "user123",
        role: "user",
        phone: "+39123456789",
        address: {
            street: "Via Roma 789",
            city: "Milano",
            state: "Lombardia",
            zipCode: "20100",
            country: "Italia"
        },
        preferences: {
            currency: "EUR",
            language: "it",
            notifications: {
                email: true,
                sms: false
            }
        }
    }
];

/**
 * Generar usuarios aleatorios adicionales
 */
const generateRandomUsers = async (count = 50) => {
    console.log(`🎲 Generando ${count} usuarios aleatorios...`);

    const firstNames = [
        "Alejandro", "Sofia", "Diego", "Valentina", "Santiago", "Isabella",
        "Mateo", "Camila", "Sebastian", "Valeria", "Leonardo", "Ximena",
        "Emiliano", "Daniela", "Miguel", "Gabriela", "Adrian", "Natalia",
        "Rodrigo", "Andrea", "Gonzalo", "Fernanda", "Andrés", "Paola",
        "Nicolás", "Alejandra", "Javier", "María", "Carlos", "Ana",
        "Fernando", "Lucía", "Rafael", "Elena", "Manuel", "Carmen",
        "Ricardo", "Laura", "José", "Isabel", "Antonio", "Pilar",
        "Francisco", "Rosa", "Juan", "Mercedes", "Pedro", "Dolores",
        "Luis", "Concepción"
    ];

    const lastNames = [
        "García", "Rodríguez", "González", "Fernández", "López", "Martínez",
        "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz",
        "Hernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero",
        "Alonso", "Gutiérrez", "Navarro", "Torres", "Domínguez", "Vázquez",
        "Ramos", "Gil", "Ramírez", "Serrano", "Blanco", "Suárez",
        "Molina", "Morales", "Ortega", "Delgado", "Castro", "Ortiz",
        "Rubio", "Marín", "Sanz", "Iglesias", "Medina", "Cortés",
        "Castillo", "Garrido", "Santos", "Guerrero", "Lozano", "Cano"
    ];

    const cities = [
        { city: "Madrid", state: "Madrid", country: "España", zip: "28001" },
        { city: "Barcelona", state: "Cataluña", country: "España", zip: "08001" },
        { city: "Valencia", state: "Valencia", country: "España", zip: "46001" },
        { city: "Sevilla", state: "Andalucía", country: "España", zip: "41001" },
        { city: "Bilbao", state: "País Vasco", country: "España", zip: "48001" },
        { city: "Málaga", state: "Andalucía", country: "España", zip: "29001" },
        { city: "Granada", state: "Andalucía", country: "España", zip: "18001" },
        { city: "Murcia", state: "Murcia", country: "España", zip: "30001" },
        { city: "Zaragoza", state: "Aragón", country: "España", zip: "50001" },
        { city: "Palma", state: "Baleares", country: "España", zip: "07001" }
    ];

    const randomUsers = [];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const location = cities[Math.floor(Math.random() * cities.length)];
        const userNumber = Math.floor(Math.random() * 9999) + 1000;

        const user = {
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${userNumber}@email.com`,
            password: "user123",
            role: "user",
            phone: `+34${Math.floor(Math.random() * 900000000) + 100000000}`,
            address: {
                street: `Calle ${firstName} ${Math.floor(Math.random() * 999) + 1}`,
                city: location.city,
                state: location.state,
                zipCode: location.zip,
                country: location.country
            },
            preferences: {
                currency: "EUR",
                language: "es",
                notifications: {
                    email: Math.random() > 0.3,
                    sms: Math.random() > 0.7
                }
            },
            isActive: Math.random() > 0.1, // 90% activos
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Último año
        };

        randomUsers.push(user);
    }

    return randomUsers;
};

/**
 * Crear usuarios de muestra
 */
const createSampleUsers = async () => {
    console.log('👥 Creando usuarios de muestra...');

    try {
        // Limpiar usuarios existentes si se especifica
        if (process.argv.includes('--clean')) {
            await userModel.deleteMany({ role: { $ne: 'admin' } }); // Mantener admin existente
            console.log('🗑️ Usuarios existentes eliminados (excepto admin)');
        }

        // Hash de contraseñas
        const usersWithHashedPasswords = await Promise.all(
            sampleUsers.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return {
                    ...user,
                    password: hashedPassword
                };
            })
        );

        // Crear usuarios de muestra
        await userModel.insertMany(usersWithHashedPasswords);
        console.log(`✅ ${sampleUsers.length} usuarios de muestra creados`);

        // Generar usuarios aleatorios si se especifica
        if (process.argv.includes('--random')) {
            const randomCount = parseInt(process.argv[process.argv.indexOf('--random') + 1]) || 50;
            const randomUsers = await generateRandomUsers(randomCount);
            
            // Hash de contraseñas para usuarios aleatorios
            const randomUsersWithHashedPasswords = await Promise.all(
                randomUsers.map(async (user) => {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    return {
                        ...user,
                        password: hashedPassword
                    };
                })
            );

            await userModel.insertMany(randomUsersWithHashedPasswords);
            console.log(`✅ ${randomUsers.length} usuarios aleatorios creados`);
        }

        // Mostrar estadísticas
        await showUserStats();

    } catch (error) {
        console.error('❌ Error creando usuarios:', error);
        throw error;
    }
};

/**
 * Mostrar estadísticas de usuarios
 */
const showUserStats = async () => {
    console.log('\n📊 Estadísticas de usuarios:');
    
    try {
        const stats = await userModel.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    activeUsers: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    },
                    avgCreatedAt: { $avg: '$createdAt' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} usuarios (${stat.activeUsers} activos)`);
        });

        const totalUsers = await userModel.countDocuments();
        const activeUsers = await userModel.countDocuments({ isActive: true });
        const recentUsers = await userModel.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        console.log(`\n🎯 Total: ${totalUsers} usuarios`);
        console.log(`✅ Activos: ${activeUsers} usuarios`);
        console.log(`📅 Nuevos (30 días): ${recentUsers} usuarios`);

        // Mostrar algunos usuarios de ejemplo
        console.log('\n👤 Usuarios de ejemplo creados:');
        const exampleUsers = await userModel.find({}, 'name email role')
            .limit(10)
            .lean();

        exampleUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
        });

    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
    }
};

/**
 * Crear usuarios de prueba específicos
 */
const createTestUsers = async () => {
    console.log('🧪 Creando usuarios de prueba específicos...');

    const testUsers = [
        {
            name: "Usuario Inactivo",
            email: "inactive@test.com",
            password: await bcrypt.hash("test123", 10),
            role: "user",
            isActive: false,
            phone: "+1234567890"
        },
        {
            name: "Usuario Sin Dirección",
            email: "noaddress@test.com",
            password: await bcrypt.hash("test123", 10),
            role: "user",
            isActive: true,
            phone: "+1234567891"
        },
        {
            name: "Usuario Premium",
            email: "premium@test.com",
            password: await bcrypt.hash("test123", 10),
            role: "user",
            isActive: true,
            phone: "+1234567892",
            preferences: {
                currency: "USD",
                language: "en",
                notifications: {
                    email: true,
                    sms: true
                }
            }
        }
    ];

    await userModel.insertMany(testUsers);
    console.log(`✅ ${testUsers.length} usuarios de prueba creados`);
};

/**
 * Función principal
 */
const main = async () => {
    console.log('🚀 Iniciando generación de usuarios de muestra...\n');

    try {
        await connectDB();

        // Crear usuarios de muestra
        await createSampleUsers();

        // Crear usuarios de prueba si se especifica
        if (process.argv.includes('--test-users')) {
            console.log('');
            await createTestUsers();
        }

        console.log('\n🎉 Generación de usuarios completada exitosamente');
        console.log('💡 Ahora tienes usuarios diversos para probar el sistema');

        console.log('\n🔑 Credenciales de acceso:');
        console.log('  Admin: admin@mitienda.com / admin123');
        console.log('  Moderator: moderator@mitienda.com / moderator123');
        console.log('  Seller: seller1@mitienda.com / seller123');
        console.log('  User: laura.fernandez@email.com / user123');

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
    createSampleUsers,
    generateRandomUsers,
    createTestUsers,
    showUserStats
};
