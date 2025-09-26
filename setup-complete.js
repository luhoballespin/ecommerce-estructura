#!/usr/bin/env node

/**
 * Script maestro para setup completo del sistema
 * Ejecuta todos los scripts necesarios para tener la aplicación lista
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando setup completo del sistema E-Commerce MERN...\n');

/**
 * Ejecutar comando de forma síncrona
 */
const runCommand = (command, args = [], cwd = process.cwd()) => {
    return new Promise((resolve, reject) => {
        console.log(`📦 Ejecutando: ${command} ${args.join(' ')}`);
        
        const child = spawn(command, args, {
            cwd: cwd,
            stdio: 'inherit',
            shell: true
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Comando falló con código ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
};

/**
 * Verificar si existe archivo .env
 */
const checkEnvFile = () => {
    const envPath = path.join(__dirname, 'backend', '.env');
    if (!fs.existsSync(envPath)) {
        console.log('⚠️ Archivo .env no encontrado en backend/');
        console.log('📝 Copiando env.example a .env...');
        
        const envExamplePath = path.join(__dirname, 'env.example');
        if (fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
            console.log('✅ Archivo .env creado desde env.example');
            console.log('🔧 Por favor edita backend/.env con tus configuraciones antes de continuar');
            return false;
        } else {
            console.log('❌ No se encontró env.example');
            return false;
        }
    }
    return true;
};

/**
 * Función principal
 */
const main = async () => {
    try {
        // Verificar archivo .env
        if (!checkEnvFile()) {
            console.log('\n⏸️ Setup pausado. Por favor configura el archivo .env y ejecuta nuevamente.');
            process.exit(1);
        }

        console.log('✅ Archivo .env encontrado\n');

        // 1. Instalar dependencias del backend
        console.log('📦 Paso 1/6: Instalando dependencias del backend...');
        await runCommand('npm', ['install'], path.join(__dirname, 'backend'));
        console.log('✅ Dependencias del backend instaladas\n');

        // 2. Instalar dependencias del frontend
        console.log('📦 Paso 2/6: Instalando dependencias del frontend...');
        await runCommand('npm', ['install'], path.join(__dirname, 'frontend'));
        console.log('✅ Dependencias del frontend instaladas\n');

        // 3. Ejecutar migración de base de datos
        console.log('🗄️ Paso 3/6: Configurando base de datos...');
        await runCommand('npm', ['run', 'migrate'], path.join(__dirname, 'backend'));
        console.log('✅ Base de datos configurada\n');

        // 4. Optimizar base de datos
        console.log('⚡ Paso 4/6: Optimizando base de datos...');
        await runCommand('npm', ['run', 'optimize-db-with-samples'], path.join(__dirname, 'backend'));
        console.log('✅ Base de datos optimizada\n');

        // 5. Generar datos de muestra
        console.log('🎭 Paso 5/6: Generando datos de muestra...');
        await runCommand('npm', ['run', 'generate-all'], path.join(__dirname, 'backend'));
        console.log('✅ Datos de muestra generados\n');

        // 6. Verificar instalación
        console.log('🔍 Paso 6/6: Verificando instalación...');
        
        // Verificar que MongoDB esté corriendo (opcional)
        try {
            await runCommand('mongosh', ['--eval', 'db.runCommand("ping")'], path.join(__dirname, 'backend'));
            console.log('✅ MongoDB está corriendo');
        } catch (error) {
            console.log('⚠️ No se pudo verificar MongoDB. Asegúrate de que esté corriendo.');
        }

        console.log('\n🎉 ¡Setup completo terminado exitosamente!');
        console.log('\n📋 Resumen de lo que se ha configurado:');
        console.log('  ✅ Dependencias instaladas (backend y frontend)');
        console.log('  ✅ Base de datos configurada y optimizada');
        console.log('  ✅ Usuarios de muestra creados');
        console.log('  ✅ Productos de muestra creados');
        console.log('  ✅ Órdenes de muestra creadas');
        console.log('  ✅ Índices de base de datos optimizados');

        console.log('\n🔑 Credenciales de acceso:');
        console.log('  👑 Admin: admin@mitienda.com / admin123');
        console.log('  👨‍💼 Moderator: moderator@mitienda.com / moderator123');
        console.log('  🛍️ Seller: seller1@mitienda.com / seller123');
        console.log('  👤 User: laura.fernandez@email.com / user123');

        console.log('\n🚀 Comandos para ejecutar la aplicación:');
        console.log('  Backend: cd backend && npm run dev');
        console.log('  Frontend: cd frontend && npm start');
        console.log('  Docker: docker-compose up -d');

        console.log('\n📚 Documentación disponible:');
        console.log('  📖 README.md - Guía principal');
        console.log('  📋 API_DOCUMENTATION.md - Documentación de la API');
        console.log('  🔧 Scripts disponibles en package.json');

        console.log('\n💡 Tu aplicación E-Commerce está lista para usar!');

    } catch (error) {
        console.error('\n❌ Error durante el setup:', error.message);
        console.log('\n🔧 Posibles soluciones:');
        console.log('  1. Verifica que MongoDB esté corriendo');
        console.log('  2. Revisa la configuración en backend/.env');
        console.log('  3. Asegúrate de tener Node.js 16+ instalado');
        console.log('  4. Ejecuta los pasos individualmente si es necesario');
        process.exit(1);
    }
};

// Ejecutar setup
main();
