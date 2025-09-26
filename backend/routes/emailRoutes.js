const express = require('express');
const {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendOrderShipped,
  sendCustomEmail
} = require('../controller/email/emailController');
const authToken = require('../middleware/authToken');
const { requireRole } = require('../middleware/authorize');
const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authToken);

// Enviar email de bienvenida
router.post('/welcome/:userId',
  requireRole(['admin', 'moderator']),
  sendWelcomeEmail
);

// Enviar confirmación de pedido
router.post('/order-confirmation/:orderId',
  requireRole(['admin', 'moderator']),
  sendOrderConfirmation
);

// Enviar notificación de envío
router.post('/order-shipped/:orderId',
  requireRole(['admin', 'moderator']),
  sendOrderShipped
);

// Enviar email personalizado (solo admin)
router.post('/custom',
  requireRole(['admin']),
  sendCustomEmail
);

module.exports = router;
