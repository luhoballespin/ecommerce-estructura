const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');
const userModel = require('../../models/userModel');
const orderModel = require('../../models/orderModel');

/**
 * Controlador para manejar notificaciones por email
 */

// Configurar transporter de email
const createTransporter = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
  
  let transporterConfig = {};
  
  switch (emailProvider) {
    case 'gmail':
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
      break;
      
    case 'sendgrid':
      transporterConfig = {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      };
      break;
      
    case 'smtp':
      transporterConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };
      break;
      
    default:
      throw new Error(`Proveedor de email no soportado: ${emailProvider}`);
  }
  
  return nodemailer.createTransporter(transporterConfig);
};

// Plantillas de email
const emailTemplates = {
  welcome: (user) => ({
    subject: `¡Bienvenido a ${process.env.APP_NAME || 'Mi Tienda'}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">¡Bienvenido!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${process.env.APP_NAME || 'Mi Tienda'}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">¡Hola ${user.name}!</h2>
          
          <p>Nos complace darte la bienvenida a nuestra plataforma. Tu cuenta ha sido creada exitosamente.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">Información de tu cuenta:</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Fecha de registro:</strong> ${new Date().toLocaleDateString('es-MX')}</p>
          </div>
          
          <p>Ahora puedes:</p>
          <ul style="color: #666;">
            <li>Explorar nuestros productos</li>
            <li>Realizar compras seguras</li>
            <li>Seguir el estado de tus pedidos</li>
            <li>Gestionar tu perfil</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Comenzar a Comprar
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2024 ${process.env.APP_NAME || 'Mi Tienda'}. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `
  }),
  
  orderConfirmation: (order) => ({
    subject: `Confirmación de Pedido #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Pedido</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">¡Pedido Confirmado!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">#${order.orderNumber}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">¡Gracias por tu compra, ${order.customer.name}!</h2>
          
          <p>Tu pedido ha sido procesado exitosamente y está siendo preparado para el envío.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #28a745;">Detalles del Pedido:</h3>
            <p><strong>Número de Pedido:</strong> #${order.orderNumber}</p>
            <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-MX')}</p>
            <p><strong>Total:</strong> $${order.pricing.total.toFixed(2)}</p>
            <p><strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">${order.status}</span></p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Productos:</h3>
            ${order.items.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div>
                  <strong>${item.productName}</strong><br>
                  <small>Cantidad: ${item.quantity}</small>
                </div>
                <div style="text-align: right;">
                  $${(item.sellingPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Ver Detalles del Pedido
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Te enviaremos un email cuando tu pedido sea enviado con el número de seguimiento.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2024 ${process.env.APP_NAME || 'Mi Tienda'}. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `
  }),
  
  orderShipped: (order) => ({
    subject: `Tu pedido #${order.orderNumber} ha sido enviado`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pedido Enviado</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🚚 ¡Tu pedido está en camino!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">#${order.orderNumber}</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">¡Excelentes noticias, ${order.customer.name}!</h2>
          
          <p>Tu pedido ha sido enviado y está en camino a tu dirección.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0; color: #007bff;">Información de Envío:</h3>
            <p><strong>Número de Seguimiento:</strong> ${order.shipping.trackingNumber || 'Se asignará pronto'}</p>
            <p><strong>Método de Envío:</strong> ${order.shipping.method}</p>
            <p><strong>Fecha de Envío:</strong> ${new Date(order.shipping.shippedAt).toLocaleDateString('es-MX')}</p>
            <p><strong>Tiempo Estimado:</strong> ${order.shipping.estimatedDelivery || '3-5 días hábiles'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${order.shipping.trackingUrl || '#'}" 
               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Rastrear Mi Pedido
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            ¡Gracias por elegirnos! Esperamos que disfrutes tu compra.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2024 ${process.env.APP_NAME || 'Mi Tienda'}. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `
  })
};

// Función para enviar email
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = emailTemplates[template](data);
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Mi Tienda'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully to ${to}`, {
      messageId: result.messageId,
      template: template
    });
    
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`, { 
      stack: error.stack,
      template: template 
    });
    
    throw error;
  }
};

// Controladores específicos
const sendWelcomeEmail = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    await sendEmail(user.email, 'welcome', user);
    
    res.json({
      success: true,
      message: 'Email de bienvenida enviado exitosamente'
    });
    
  } catch (error) {
    logger.error(`Error sending welcome email: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error al enviar el email de bienvenida',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

const sendOrderConfirmation = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await orderModel.findById(orderId).populate('customer.userId');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    await sendEmail(order.customer.email, 'orderConfirmation', order);
    
    res.json({
      success: true,
      message: 'Email de confirmación de pedido enviado exitosamente'
    });
    
  } catch (error) {
    logger.error(`Error sending order confirmation email: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error al enviar el email de confirmación',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

const sendOrderShipped = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await orderModel.findById(orderId).populate('customer.userId');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    await sendEmail(order.customer.email, 'orderShipped', order);
    
    res.json({
      success: true,
      message: 'Email de envío enviado exitosamente'
    });
    
  } catch (error) {
    logger.error(`Error sending order shipped email: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error al enviar el email de envío',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Función para enviar email personalizado
const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Email, asunto y contenido HTML son requeridos'
      });
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Mi Tienda'}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    logger.info(`Custom email sent successfully to ${to}`, {
      messageId: result.messageId
    });
    
    res.json({
      success: true,
      message: 'Email enviado exitosamente',
      messageId: result.messageId
    });
    
  } catch (error) {
    logger.error(`Error sending custom email: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error al enviar el email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendOrderShipped,
  sendCustomEmail
};
