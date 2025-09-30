/**
 * Script de verificación para el despliegue
 * Verifica que todas las configuraciones estén correctas antes del despliegue
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración para despliegue...\n');

// Función para verificar si un archivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Función para verificar si un archivo contiene cierta configuración
function fileContains(filePath, searchString) {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchString);
}

// Función para verificar variables de entorno en un archivo
function checkEnvVars(filePath, requiredVars) {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  const missingVars = requiredVars.filter(varName => !content.includes(varName));
  return missingVars.length === 0;
}

let allChecksPassed = true;

// Verificaciones del Backend
console.log('📋 VERIFICACIONES DEL BACKEND:');
console.log('================================');

// 1. Verificar archivos de configuración
const backendChecks = [
  { file: 'backend/index.js', desc: 'Archivo principal del backend' },
  { file: 'backend/middleware/security.js', desc: 'Middleware de seguridad' },
  { file: 'backend/middleware/cors.js', desc: 'Configuración de CORS' },
  { file: 'backend/scripts/setup-production.js', desc: 'Script de configuración de producción' },
  { file: 'env.production', desc: 'Variables de entorno de producción' },
  { file: 'render.yaml', desc: 'Configuración de Render' }
];

backendChecks.forEach(check => {
  if (fileExists(check.file)) {
    console.log(`✅ ${check.desc}: ${check.file}`);
  } else {
    console.log(`❌ ${check.desc}: ${check.file} - FALTANTE`);
    allChecksPassed = false;
  }
});

// 2. Verificar variables de entorno críticas del backend
console.log('\n🔧 Variables de entorno del backend:');
const backendEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'TOKEN_SECRET_KEY',
  'SESSION_SECRET',
  'FRONTEND_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY'
];

if (checkEnvVars('env.production', backendEnvVars)) {
  console.log('✅ Variables de entorno del backend configuradas');
} else {
  console.log('❌ Faltan variables de entorno del backend');
  allChecksPassed = false;
}

// Verificaciones del Frontend
console.log('\n📋 VERIFICACIONES DEL FRONTEND:');
console.log('================================');

const frontendChecks = [
  { file: 'vercel.json', desc: 'Configuración de Vercel' },
  { file: 'frontend/env.production', desc: 'Variables de entorno del frontend' },
  { file: 'frontend/public/_redirects', desc: 'Configuración de redirects' },
  { file: 'frontend/next.config.js', desc: 'Configuración de Next.js' }
];

frontendChecks.forEach(check => {
  if (fileExists(check.file)) {
    console.log(`✅ ${check.desc}: ${check.file}`);
  } else {
    console.log(`❌ ${check.desc}: ${check.file} - FALTANTE`);
    allChecksPassed = false;
  }
});

// 3. Verificar variables de entorno del frontend
console.log('\n🔧 Variables de entorno del frontend:');
const frontendEnvVars = [
  'REACT_APP_API_URL',
  'REACT_APP_STRIPE_PUBLISHABLE_KEY'
];

if (checkEnvVars('frontend/env.production', frontendEnvVars)) {
  console.log('✅ Variables de entorno del frontend configuradas');
} else {
  console.log('❌ Faltan variables de entorno del frontend');
  allChecksPassed = false;
}

// Verificaciones de Seguridad
console.log('\n📋 VERIFICACIONES DE SEGURIDAD:');
console.log('================================');

// 1. Verificar que no haya archivos .env en el repositorio
const envFiles = ['.env', 'backend/.env', 'frontend/.env'];
const envFilesFound = envFiles.filter(file => fileExists(file));

if (envFilesFound.length === 0) {
  console.log('✅ No se encontraron archivos .env en el repositorio (correcto)');
} else {
  console.log('⚠️  Se encontraron archivos .env en el repositorio:');
  envFilesFound.forEach(file => console.log(`   - ${file}`));
  console.log('   Asegúrate de que estén en .gitignore');
}

// 2. Verificar configuración de CORS
if (fileContains('backend/middleware/cors.js', 'productionCorsOptions')) {
  console.log('✅ Configuración de CORS para producción encontrada');
} else {
  console.log('❌ Configuración de CORS para producción no encontrada');
  allChecksPassed = false;
}

// 3. Verificar middleware de seguridad
if (fileContains('backend/middleware/security.js', 'securityHeaders')) {
  console.log('✅ Middleware de seguridad configurado');
} else {
  console.log('❌ Middleware de seguridad no configurado');
  allChecksPassed = false;
}

// Verificaciones de Configuración
console.log('\n📋 VERIFICACIONES DE CONFIGURACIÓN:');
console.log('===================================');

// 1. Verificar package.json del backend
if (fileContains('backend/package.json', 'setup-production')) {
  console.log('✅ Script de configuración de producción en package.json');
} else {
  console.log('❌ Script de configuración de producción no encontrado');
  allChecksPassed = false;
}

// 2. Verificar configuración de Vercel
if (fileContains('vercel.json', 'builds') && fileContains('vercel.json', 'routes')) {
  console.log('✅ Configuración de Vercel completa');
} else {
  console.log('❌ Configuración de Vercel incompleta');
  allChecksPassed = false;
}

// 3. Verificar configuración de Render
if (fileContains('render.yaml', 'services') && fileContains('render.yaml', 'databases')) {
  console.log('✅ Configuración de Render completa');
} else {
  console.log('❌ Configuración de Render incompleta');
  allChecksPassed = false;
}

// Resultado Final
console.log('\n🎯 RESULTADO FINAL:');
console.log('==================');

if (allChecksPassed) {
  console.log('🎉 ¡Todas las verificaciones pasaron!');
  console.log('✅ Tu aplicación está lista para desplegarse');
  console.log('\n📝 PRÓXIMOS PASOS:');
  console.log('1. Configura las variables de entorno en Vercel y Render');
  console.log('2. Conecta tu repositorio a ambas plataformas');
  console.log('3. Configura MongoDB Atlas');
  console.log('4. Configura Stripe con claves de producción');
  console.log('5. Sigue la guía DEPLOYMENT_GUIDE.md');
} else {
  console.log('❌ Algunas verificaciones fallaron');
  console.log('⚠️  Revisa los errores antes de continuar');
  console.log('\n📝 ACCIONES REQUERIDAS:');
  console.log('1. Corrige los archivos faltantes o mal configurados');
  console.log('2. Ejecuta este script nuevamente');
  console.log('3. Una vez que todas las verificaciones pasen, procede con el despliegue');
}

console.log('\n📚 Para más información, consulta DEPLOYMENT_GUIDE.md');
