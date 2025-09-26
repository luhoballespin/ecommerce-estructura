const express = require('express');
const passport = require('passport');
const router = express.Router();

// Importar controladores
const {
  googleAuth,
  googleCallback,
  googleAuthFailure,
  getUserInfo,
  linkGoogleAccount,
  unlinkGoogleAccount
} = require('../controller/auth/googleAuth');

const userSignInController = require('../controller/user/userSignIn');
const userSignUpController = require('../controller/user/userSignUp');
const userLogoutController = require('../controller/user/userLogout');

// Middleware de autenticación
const authToken = require('../middleware/authToken');

// ==================== RUTAS DE AUTENTICACIÓN ====================

/**
 * @route   GET /api/auth/google
 * @desc    Iniciar autenticación con Google OAuth
 * @access  Public
 */
router.get('/google', googleAuth, passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account' // Forzar selección de cuenta
}));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Callback de Google OAuth
 * @access  Public
 */
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/google/failure',
    session: false // No usar sesiones, usar JWT
  }),
  googleCallback
);

/**
 * @route   GET /api/auth/google/failure
 * @desc    Manejo de errores de Google OAuth
 * @access  Public
 */
router.get('/google/failure', googleAuthFailure);

/**
 * @route   POST /api/auth/login
 * @desc    Login con email y contraseña
 * @access  Public
 */
router.post('/login', userSignInController);

/**
 * @route   POST /api/auth/register
 * @desc    Registro de nuevo usuario
 * @access  Public
 */
router.post('/register', userSignUpController);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', authToken, userLogoutController);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', authToken, getUserInfo);

/**
 * @route   POST /api/auth/link-google
 * @desc    Vincular cuenta Google a usuario existente
 * @access  Private
 */
router.post('/link-google', authToken, linkGoogleAccount);

/**
 * @route   DELETE /api/auth/unlink-google
 * @desc    Desvincular cuenta Google
 * @access  Private
 */
router.delete('/unlink-google', authToken, unlinkGoogleAccount);

/**
 * @route   GET /api/auth/status
 * @desc    Verificar estado de autenticación
 * @access  Public
 */
router.get('/status', (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(200).json({
      authenticated: false,
      message: "No hay token de autenticación"
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.TOKEN_SECRET_KEY);

    res.status(200).json({
      authenticated: true,
      user: {
        id: decoded._id,
        email: decoded.email,
        role: decoded.role
      },
      message: "Token válido"
    });
  } catch (error) {
    res.status(200).json({
      authenticated: false,
      message: "Token inválido o expirado"
    });
  }
});

module.exports = router;
