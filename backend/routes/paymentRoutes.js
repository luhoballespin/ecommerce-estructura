const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  createSetupIntent,
  getPaymentMethods
} = require('../controller/payment/stripeController');
const authToken = require('../middleware/authToken');
const router = express.Router();

// Webhook de Stripe (sin autenticación)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Rutas protegidas (aplicar authToken solo a las rutas específicas)

// Crear intent de pago
router.post('/stripe/create-payment-intent', authToken, createPaymentIntent);

// Confirmar pago
router.post('/stripe/confirm-payment', authToken, confirmPayment);

// Crear setup intent para métodos de pago guardados
router.post('/stripe/setup-intent', authToken, createSetupIntent);

// Obtener métodos de pago guardados
router.get('/stripe/payment-methods/:customerId', authToken, getPaymentMethods);

module.exports = router;
