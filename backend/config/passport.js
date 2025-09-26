const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

/**
 * Configuración de Passport para autenticación
 * Incluye estrategias para Google OAuth, JWT y Local
 */

// Estrategia Local (email/password)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return done(null, false, { message: 'Usuario no encontrado' });
    }

    if (!user.isActive) {
      return done(null, false, { message: 'Cuenta desactivada' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return done(null, false, { message: 'Contraseña incorrecta' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Estrategia JWT
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || process.env.TOKEN_SECRET_KEY
}, async (payload, done) => {
  try {
    const user = await userModel.findById(payload._id).select('-password');

    if (!user) {
      return done(null, false);
    }

    if (!user.isActive) {
      return done(null, false, { message: 'Cuenta desactivada' });
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// Estrategia Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Verificar si el usuario ya existe
    let user = await userModel.findOne({
      $or: [
        { email: profile.emails[0].value },
        { googleId: profile.id }
      ]
    });

    if (user) {
      // Si el usuario existe pero no tiene googleId, agregarlo
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    // Crear nuevo usuario
    const newUser = new userModel({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      profilePic: profile.photos[0].value,
      isActive: true,
      role: 'user',
      provider: 'google',
      emailVerified: true
    });

    const savedUser = await newUser.save();
    return done(null, savedUser);

  } catch (error) {
    return done(error, null);
  }
}));

// Serialización de usuario para sesiones
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
