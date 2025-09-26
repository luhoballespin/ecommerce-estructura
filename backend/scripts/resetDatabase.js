const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Script para resetear la base de datos y generar datos de muestra
 */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const resetDatabase = async () => {
  try {
    console.log('🗑️ Limpiando base de datos...');

    // Limpiar todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();

    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`✅ Colección ${collection.name} limpiada`);
    }

    console.log('✅ Base de datos limpiada exitosamente');

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('✅ Conexión cerrada');

  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  connectDB().then(() => {
    resetDatabase();
  });
}

module.exports = { resetDatabase };
