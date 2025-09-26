const mongoose = require('mongoose');

/**
 * Script para verificar la conexión a MongoDB
 * Proporciona instrucciones si MongoDB no está disponible
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function checkMongoDB() {
    console.log('🔍 Verificando conexión a MongoDB...');
    console.log(`📍 URI: ${MONGODB_URI}`);
    
    try {
        // Intentar conectar con timeout corto
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 segundos timeout
            connectTimeoutMS: 5000
        });
        
        console.log('✅ MongoDB está corriendo y accesible');
        
        // Probar una operación básica
        await mongoose.connection.db.admin().ping();
        console.log('✅ Conexión a MongoDB verificada exitosamente');
        
        await mongoose.connection.close();
        return true;
        
    } catch (error) {
        console.log('❌ Error conectando a MongoDB:');
        console.log(`   ${error.message}`);
        
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connection refused')) {
            console.log('\n🔧 SOLUCIÓN: MongoDB no está corriendo');
            console.log('   Para instalar y ejecutar MongoDB:');
            console.log('   1. Descarga MongoDB Community Server desde: https://www.mongodb.com/try/download/community');
            console.log('   2. Instala MongoDB');
            console.log('   3. Inicia el servicio de MongoDB:');
            console.log('      - Windows: net start MongoDB');
            console.log('      - macOS: brew services start mongodb-community');
            console.log('      - Linux: sudo systemctl start mongod');
            console.log('   4. O ejecuta manualmente: mongod');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo ENOTFOUND')) {
            console.log('\n🔧 SOLUCIÓN: Host de MongoDB no encontrado');
            console.log('   Verifica que la URI de MongoDB sea correcta en el archivo .env');
        } else if (error.message.includes('authentication failed')) {
            console.log('\n🔧 SOLUCIÓN: Error de autenticación');
            console.log('   Verifica las credenciales de MongoDB en el archivo .env');
        } else {
            console.log('\n🔧 SOLUCIÓN: Error desconocido');
            console.log('   Revisa la configuración de MongoDB en el archivo .env');
            console.log('   Asegúrate de que MongoDB esté instalado y corriendo');
        }
        
        console.log('\n📚 Alternativas:');
        console.log('   1. Usar MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
        console.log('   2. Usar Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
        console.log('   3. Usar MongoDB local con configuración personalizada');
        
        return false;
    }
}

// Ejecutar verificación
if (require.main === module) {
    require('dotenv').config();
    checkMongoDB()
        .then(success => {
            if (success) {
                console.log('\n🎉 MongoDB está listo para usar');
                process.exit(0);
            } else {
                console.log('\n⚠️ MongoDB no está disponible');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Error inesperado:', error);
            process.exit(1);
        });
}

module.exports = { checkMongoDB };
