// Verificar que Stripe esté configurado
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY no está configurado. Los pagos no funcionarán.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const orderModel = require('../../models/orderModel');
const logger = require('../../utils/logger');

/**
 * Controlador para manejar pagos con Stripe
 */

// Crear intent de pago
const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe no está configurado. Contacta al administrador.'
      });
    }

    const { amount, currency = 'ars', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
    }

    // Convertir a centavos para Stripe
    const amountInCents = Math.round(amount * 100);

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId || 'temp-' + Date.now(),
        userId: req.userId
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info(`Payment intent created: ${paymentIntent.id} for user: ${req.userId}`);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    logger.error(`Error creating payment intent: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error al crear el intent de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Confirmar pago
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'ID del payment intent es requerido'
      });
    }

    // Recuperar el PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Actualizar la orden en la base de datos
      if (orderId) {
        const order = await orderModel.findById(orderId);
        if (order) {
          order.payment.status = 'completed';
          order.payment.paymentIntentId = paymentIntentId;
          order.payment.paidAt = new Date();
          order.status = 'confirmed';

          await order.save();

          logger.info(`Order ${orderId} payment confirmed with Stripe: ${paymentIntentId}`);
        }
      }

      res.json({
        success: true,
        message: 'Pago confirmado exitosamente',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'El pago no fue completado exitosamente',
        status: paymentIntent.status
      });
    }

  } catch (error) {
    logger.error(`Error confirming payment: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error al confirmar el pago',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Webhook para eventos de Stripe
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.info(`Payment succeeded: ${paymentIntent.id}`);

      // Actualizar orden si existe
      if (paymentIntent.metadata.orderId) {
        try {
          const order = await orderModel.findById(paymentIntent.metadata.orderId);
          if (order) {
            order.payment.status = 'completed';
            order.payment.paymentIntentId = paymentIntent.id;
            order.payment.paidAt = new Date();
            order.status = 'confirmed';

            await order.save();

            logger.info(`Order ${paymentIntent.metadata.orderId} updated via webhook`);
          }
        } catch (error) {
          logger.error(`Error updating order via webhook: ${error.message}`);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      logger.warn(`Payment failed: ${failedPayment.id}`);

      // Actualizar orden si existe
      if (failedPayment.metadata.orderId) {
        try {
          const order = await orderModel.findById(failedPayment.metadata.orderId);
          if (order) {
            order.payment.status = 'failed';
            order.status = 'payment_failed';

            await order.save();

            logger.info(`Order ${failedPayment.metadata.orderId} marked as payment failed`);
          }
        } catch (error) {
          logger.error(`Error updating failed order via webhook: ${error.message}`);
        }
      }
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// Crear método de pago por defecto (para suscripciones futuras)
const createSetupIntent = async (req, res) => {
  try {
    const { customerId } = req.body;

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    res.json({
      success: true,
      clientSecret: setupIntent.client_secret
    });

  } catch (error) {
    logger.error(`Error creating setup intent: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error al crear el setup intent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener métodos de pago guardados
const getPaymentMethods = async (req, res) => {
  try {
    const { customerId } = req.params;

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.json({
      success: true,
      paymentMethods: paymentMethods.data
    });

  } catch (error) {
    logger.error(`Error getting payment methods: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error al obtener métodos de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  createSetupIntent,
  getPaymentMethods
};
