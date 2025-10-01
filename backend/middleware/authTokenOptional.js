const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

/**
 * Middleware de autenticación JWT opcional para logout
 * Permite tokens expirados para cerrar sesión correctamente
 */
async function authTokenOptional(req, res, next) {
  try {
    // Obtener token de cookies o headers
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // No hay token, continuar sin usuario autenticado
      req.userId = null;
      req.user = null;
      return next();
    }

    // Intentar verificar token (incluso si está expirado)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      console.log('✅ Token válido para logout usuario:', decoded._id);
    } catch (jwtError) {
      // Token expirado o inválido, pero permitir logout
      console.log('⚠️ Token expirado/inválido para logout:', jwtError.message);

      // Intentar decodificar sin verificar para obtener el ID del usuario
      try {
        decoded = jwt.decode(token);
        if (decoded && decoded._id) {
          console.log('📋 Usuario identificado para logout:', decoded._id);
          req.userId = decoded._id;
          req.user = null; // No verificar usuario en DB para tokens expirados
          return next();
        }
      } catch (decodeError) {
        console.log('❌ No se pudo decodificar token para logout');
      }

      // Si no se puede decodificar, continuar sin usuario
      req.userId = null;
      req.user = null;
      return next();
    }

    // Token válido, verificar que el usuario existe
    const user = await userModel.findById(decoded._id).select('-password');

    if (!user) {
      console.log('❌ Usuario no encontrado para logout');
      req.userId = null;
      req.user = null;
      return next();
    }

    // Usuario válido y autenticado
    req.userId = user._id;
    req.user = user;
    next();

  } catch (error) {
    console.error('Error en authTokenOptional:', error);
    req.userId = null;
    req.user = null;
    next(); // Continuar sin autenticación en caso de error
  }
}

module.exports = authTokenOptional;
