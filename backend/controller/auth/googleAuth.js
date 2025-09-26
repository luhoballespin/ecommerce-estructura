const jwt = require('jsonwebtoken');
const userModel = require('../../models/userModel');
const logger = require('../../utils/logger');

/**
 * Controlador para autenticación con Google OAuth
 */

/**
 * Iniciar autenticación con Google
 */
const googleAuth = async (req, res, next) => {
  try {
    logger.info('Iniciando autenticación con Google');
    // Passport manejará la redirección a Google
    next();
  } catch (error) {
    logger.error('Error en googleAuth:', error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: true,
      success: false,
      code: "GOOGLE_AUTH_ERROR"
    });
  }
};

/**
 * Callback de Google OAuth
 */
const googleCallback = async (req, res, next) => {
  try {
    if (req.user) {
      // Actualizar último login
      await userModel.findByIdAndUpdate(req.user._id, {
        lastLogin: new Date()
      });

      // Generar token JWT
      const token = jwt.sign(
        { _id: req.user._id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET || process.env.TOKEN_SECRET_KEY,
        { expiresIn: '7d' }
      );

      // Configurar cookie con token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      logger.info(`Usuario autenticado con Google: ${req.user.email}`);

      // Redirigir al frontend con token en query string para manejo en cliente
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/success?token=${token}&provider=google`);
    } else {
      logger.error('Fallo en autenticación con Google: No se recibió usuario');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?error=google_auth_failed`);
    }
  } catch (error) {
    logger.error('Error en googleCallback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/error?error=server_error`);
  }
};

/**
 * Fallback para errores de autenticación
 */
const googleAuthFailure = (req, res) => {
  logger.error('Falló la autenticación con Google:', req.query.error);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/auth/error?error=google_auth_failed&message=${encodeURIComponent(req.query.error || 'Error de autenticación')}`);
};

/**
 * Obtener información del usuario autenticado
 */
const getUserInfo = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
        error: true,
        success: false,
        code: "NOT_AUTHENTICATED"
      });
    }

    // No enviar información sensible
    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      provider: user.provider,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      preferences: user.preferences,
      createdAt: user.createdAt
    };

    res.status(200).json({
      message: "Información del usuario obtenida exitosamente",
      success: true,
      error: false,
      data: userInfo
    });

  } catch (error) {
    logger.error('Error obteniendo información del usuario:', error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: true,
      success: false,
      code: "GET_USER_INFO_ERROR"
    });
  }
};

/**
 * Vincular cuenta Google a usuario existente
 */
const linkGoogleAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { googleId, email, name, profilePic } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        message: "Google ID y email son requeridos",
        error: true,
        success: false,
        code: "MISSING_GOOGLE_DATA"
      });
    }

    // Verificar que el email coincida
    const user = await userModel.findById(userId);
    if (user.email !== email) {
      return res.status(400).json({
        message: "El email de Google debe coincidir con tu cuenta",
        error: true,
        success: false,
        code: "EMAIL_MISMATCH"
      });
    }

    // Verificar que no exista otro usuario con ese Google ID
    const existingGoogleUser = await userModel.findOne({ googleId });
    if (existingGoogleUser && existingGoogleUser._id.toString() !== userId) {
      return res.status(400).json({
        message: "Esta cuenta de Google ya está vinculada a otro usuario",
        error: true,
        success: false,
        code: "GOOGLE_ACCOUNT_IN_USE"
      });
    }

    // Vincular la cuenta Google
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        googleId,
        provider: 'local', // Mantener como local pero con Google vinculado
        emailVerified: true,
        profilePic: profilePic || user.profilePic,
        name: name || user.name
      },
      { new: true, select: '-password' }
    );

    logger.info(`Cuenta Google vinculada exitosamente para usuario: ${user.email}`);

    res.status(200).json({
      message: "Cuenta Google vinculada exitosamente",
      success: true,
      error: false,
      data: updatedUser
    });

  } catch (error) {
    logger.error('Error vinculando cuenta Google:', error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: true,
      success: false,
      code: "LINK_GOOGLE_ERROR"
    });
  }
};

/**
 * Desvincular cuenta Google
 */
const unlinkGoogleAccount = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user.googleId) {
      return res.status(400).json({
        message: "No tienes una cuenta Google vinculada",
        error: true,
        success: false,
        code: "NO_GOOGLE_ACCOUNT"
      });
    }

    // Verificar que tenga contraseña local
    if (!user.password) {
      return res.status(400).json({
        message: "No puedes desvincular Google sin tener una contraseña local configurada",
        error: true,
        success: false,
        code: "NO_LOCAL_PASSWORD"
      });
    }

    // Desvincular la cuenta Google
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        googleId: null,
        provider: 'local'
      },
      { new: true, select: '-password' }
    );

    logger.info(`Cuenta Google desvinculada exitosamente para usuario: ${user.email}`);

    res.status(200).json({
      message: "Cuenta Google desvinculada exitosamente",
      success: true,
      error: false,
      data: updatedUser
    });

  } catch (error) {
    logger.error('Error desvinculando cuenta Google:', error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: true,
      success: false,
      code: "UNLINK_GOOGLE_ERROR"
    });
  }
};

module.exports = {
  googleAuth,
  googleCallback,
  googleAuthFailure,
  getUserInfo,
  linkGoogleAccount,
  unlinkGoogleAccount
};
