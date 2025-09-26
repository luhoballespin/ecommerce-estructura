const nodemailer = require('nodemailer');
const { logger } = require('../middleware/logger');

/**
 * Servicio de Email
 * Maneja el envío de notificaciones por correo electrónico
 */

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Inicializar el transportador de email
     */
    initializeTransporter() {
        try {
            // Configuración para diferentes proveedores
            const emailConfig = this.getEmailConfig();
            
            this.transporter = nodemailer.createTransporter(emailConfig);
            
            // Verificar la conexión
            this.transporter.verify((error, success) => {
                if (error) {
                    logger.error('Error al verificar configuración de email:', error);
                } else {
                    logger.info('Servidor de email configurado correctamente');
                }
            });
        } catch (error) {
            logger.error('Error al inicializar servicio de email:', error);
        }
    }

    /**
     * Obtener configuración de email basada en variables de entorno
     */
    getEmailConfig() {
        const provider = process.env.EMAIL_PROVIDER || 'gmail';
        
        switch (provider.toLowerCase()) {
            case 'gmail':
                return {
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                };
            
            case 'smtp':
                return {
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT) || 587,
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                };
            
            case 'sendgrid':
                return {
                    host: 'smtp.sendgrid.net',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'apikey',
                        pass: process.env.SENDGRID_API_KEY
                    }
                };
            
            default:
                throw new Error(`Proveedor de email no soportado: ${provider}`);
        }
    }

    /**
     * Enviar email genérico
     */
    async sendEmail({ to, subject, html, text, attachments = [] }) {
        if (!this.transporter) {
            throw new Error('Servicio de email no inicializado');
        }

        const mailOptions = {
            from: {
                name: process.env.EMAIL_FROM_NAME || 'Mi Tienda Online',
                address: process.env.EMAIL_USER
            },
            to,
            subject,
            html,
            text,
            attachments
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email enviado exitosamente a ${to}:`, info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error(`Error al enviar email a ${to}:`, error);
            throw error;
        }
    }

    /**
     * Enviar email de bienvenida
     */
    async sendWelcomeEmail(user) {
        const subject = `¡Bienvenido a ${process.env.APP_NAME || 'Mi Tienda Online'}!`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Bienvenido</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido!</h1>
                    </div>
                    <div class="content">
                        <h2>Hola ${user.name},</h2>
                        <p>¡Gracias por registrarte en ${process.env.APP_NAME || 'Mi Tienda Online'}!</p>
                        <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
                        <ul>
                            <li>Explorar nuestros productos</li>
                            <li>Realizar compras seguras</li>
                            <li>Recibir ofertas exclusivas</li>
                            <li>Acceder a soporte 24/7</li>
                        </ul>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Comenzar a Comprar</a>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        <p>¡Que disfrutes tu experiencia de compra!</p>
                    </div>
                    <div class="footer">
                        <p>Este email fue enviado automáticamente. Por favor no respondas a este mensaje.</p>
                        <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Mi Tienda Online'}. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
            Hola ${user.name},
            
            ¡Gracias por registrarte en ${process.env.APP_NAME || 'Mi Tienda Online'}!
            
            Tu cuenta ha sido creada exitosamente. Visita nuestro sitio web para comenzar a comprar.
            
            Si tienes alguna pregunta, no dudes en contactarnos.
            
            ¡Que disfrutes tu experiencia de compra!
        `;

        return this.sendEmail({
            to: user.email,
            subject,
            html,
            text
        });
    }

    /**
     * Enviar email de confirmación de orden
     */
    async sendOrderConfirmationEmail(order) {
        const subject = `Confirmación de Orden #${order.orderNumber}`;
        
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <img src="${item.productImage}" alt="${item.productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.unitPrice.toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.totalPrice.toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Confirmación de Orden</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #0ea5e9; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background-color: #0ea5e9; color: white; padding: 10px; text-align: left; }
                    .total { background-color: #e5e7eb; padding: 10px; font-weight: bold; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Orden Confirmada!</h1>
                        <p>Número de Orden: ${order.orderNumber}</p>
                    </div>
                    <div class="content">
                        <h2>Hola ${order.customer.name},</h2>
                        <p>Hemos recibido tu orden y está siendo procesada. Aquí están los detalles:</p>
                        
                        <h3>Productos Ordenados:</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unitario</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div class="total">
                            <p>Subtotal: $${order.pricing.subtotal.toFixed(2)}</p>
                            <p>Impuestos: $${order.pricing.tax.toFixed(2)}</p>
                            <p>Envío: $${order.pricing.shipping.toFixed(2)}</p>
                            ${order.pricing.discount > 0 ? `<p>Descuento: -$${order.pricing.discount.toFixed(2)}</p>` : ''}
                            <p><strong>Total: $${order.pricing.total.toFixed(2)}</strong></p>
                        </div>
                        
                        <h3>Dirección de Envío:</h3>
                        <p>
                            ${order.shippingAddress.street}<br>
                            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                            ${order.shippingAddress.country}
                        </p>
                        
                        <p>Te enviaremos una notificación cuando tu orden sea enviada.</p>
                        <p>Si tienes alguna pregunta sobre tu orden, no dudes en contactarnos.</p>
                    </div>
                    <div class="footer">
                        <p>Este email fue enviado automáticamente. Por favor no respondas a este mensaje.</p>
                        <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Mi Tienda Online'}. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: order.customer.email,
            subject,
            html
        });
    }

    /**
     * Enviar email de notificación de envío
     */
    async sendShippingNotificationEmail(order) {
        const subject = `Tu orden #${order.orderNumber} ha sido enviada`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Orden Enviada</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .tracking { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Tu orden está en camino!</h1>
                        <p>Número de Orden: ${order.orderNumber}</p>
                    </div>
                    <div class="content">
                        <h2>Hola ${order.customer.name},</h2>
                        <p>¡Excelentes noticias! Tu orden ha sido enviada y está en camino.</p>
                        
                        <div class="tracking">
                            <h3>Información de Seguimiento:</h3>
                            ${order.shipping.trackingNumber ? `<p><strong>Número de Seguimiento:</strong> ${order.shipping.trackingNumber}</p>` : ''}
                            ${order.shipping.carrier ? `<p><strong>Transportista:</strong> ${order.shipping.carrier}</p>` : ''}
                            ${order.shipping.estimatedDelivery ? `<p><strong>Entrega Estimada:</strong> ${new Date(order.shipping.estimatedDelivery).toLocaleDateString()}</p>` : ''}
                        </div>
                        
                        <p>Puedes rastrear tu paquete usando la información de seguimiento proporcionada arriba.</p>
                        <p>Te enviaremos otra notificación cuando tu orden sea entregada.</p>
                    </div>
                    <div class="footer">
                        <p>Este email fue enviado automáticamente. Por favor no respondas a este mensaje.</p>
                        <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Mi Tienda Online'}. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: order.customer.email,
            subject,
            html
        });
    }

    /**
     * Enviar email de recuperación de contraseña
     */
    async sendPasswordResetEmail(user, resetToken) {
        const subject = 'Recuperación de Contraseña';
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Recuperación de Contraseña</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                    .warning { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Recuperación de Contraseña</h1>
                    </div>
                    <div class="content">
                        <h2>Hola ${user.name},</h2>
                        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                        <p>Si solicitaste este cambio, haz clic en el botón de abajo para crear una nueva contraseña:</p>
                        
                        <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                        
                        <div class="warning">
                            <p><strong>Importante:</strong> Este enlace expirará en 1 hora por razones de seguridad.</p>
                        </div>
                        
                        <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
                        
                        <p>Si tienes problemas con el botón de arriba, copia y pega este enlace en tu navegador:</p>
                        <p style="word-break: break-all; color: #0ea5e9;">${resetUrl}</p>
                    </div>
                    <div class="footer">
                        <p>Este email fue enviado automáticamente. Por favor no respondas a este mensaje.</p>
                        <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Mi Tienda Online'}. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: user.email,
            subject,
            html
        });
    }

    /**
     * Enviar email de notificación de stock bajo
     */
    async sendLowStockNotification(product, currentStock) {
        const subject = `Alerta: Stock Bajo - ${product.productName}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Alerta de Stock</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .alert { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Alerta de Stock Bajo</h1>
                    </div>
                    <div class="content">
                        <div class="alert">
                            <h3>⚠️ Atención Administrador</h3>
                            <p>El producto <strong>${product.productName}</strong> tiene stock bajo.</p>
                        </div>
                        
                        <h3>Detalles del Producto:</h3>
                        <ul>
                            <li><strong>Producto:</strong> ${product.productName}</li>
                            <li><strong>Marca:</strong> ${product.brandName}</li>
                            <li><strong>Categoría:</strong> ${product.category}</li>
                            <li><strong>Stock Actual:</strong> ${currentStock} unidades</li>
                            <li><strong>SKU:</strong> ${product.sku || 'N/A'}</li>
                        </ul>
                        
                        <p>Te recomendamos revisar el inventario y considerar hacer un nuevo pedido a tu proveedor.</p>
                        
                        <p>Puedes gestionar el stock desde el panel de administración.</p>
                    </div>
                    <div class="footer">
                        <p>Este email fue enviado automáticamente por el sistema de alertas.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Obtener emails de administradores
        const adminEmails = await this.getAdminEmails();
        
        return Promise.all(
            adminEmails.map(email => 
                this.sendEmail({
                    to: email,
                    subject,
                    html
                })
            )
        );
    }

    /**
     * Obtener emails de administradores
     */
    async getAdminEmails() {
        try {
            const userModel = require('../models/userModel');
            const admins = await userModel.find({ 
                role: { $in: ['admin', 'moderator'] },
                isActive: true 
            }).select('email');
            
            return admins.map(admin => admin.email);
        } catch (error) {
            logger.error('Error al obtener emails de administradores:', error);
            return [process.env.ADMIN_EMAIL || process.env.EMAIL_USER];
        }
    }
}

// Crear instancia singleton
const emailService = new EmailService();

module.exports = emailService;
