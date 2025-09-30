#!/bin/bash

# Script de inicio para Render
echo "🚀 Iniciando aplicación en Render..."

# Verificar que las variables de entorno requeridas estén configuradas
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI no está configurado"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET no está configurado"
    exit 1
fi

if [ -z "$TOKEN_SECRET_KEY" ]; then
    echo "❌ Error: TOKEN_SECRET_KEY no está configurado"
    exit 1
fi

echo "✅ Variables de entorno verificadas"

# Crear directorio de logs si no existe
mkdir -p logs

# Crear directorio de uploads si no existe
mkdir -p uploads

# Ejecutar migraciones de base de datos si es necesario
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🔄 Ejecutando migraciones de base de datos..."
    npm run migrate
fi

# Iniciar la aplicación
echo "🌟 Iniciando servidor..."
npm start
