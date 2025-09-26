import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaCheckCircle,
  FaTruck,
  FaEnvelope,
  FaHome,
  FaShoppingBag,
  FaDownload,
  FaShare
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import displayINRCurrency from '../../helpers/displayCurrency';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (location.state?.orderNumber) {
      setOrderData(location.state);
    } else {
      // Si no hay datos del pedido, redirigir al home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleDownloadReceipt = () => {
    // Simular descarga de recibo
    toast.success('Recibo descargado exitosamente');
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mi pedido',
        text: `¡Acabo de realizar un pedido por ${displayINRCurrency(orderData.total)}!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FaCheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-gray-600">
              Tu pedido ha sido procesado exitosamente
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Información principal del pedido */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resumen del pedido */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Resumen del Pedido
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Número de Pedido</h3>
                    <p className="text-lg font-mono text-blue-600">{orderData.orderNumber}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Total Pagado</h3>
                    <p className="text-lg font-bold text-green-600">
                      {displayINRCurrency(orderData.total)}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Fecha del Pedido</h3>
                    <p className="text-gray-600">
                      {new Date().toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Estado</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="h-4 w-4 mr-1" />
                      Confirmado
                    </span>
                  </div>
                </div>
              </div>

              {/* Productos del pedido */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Productos Pedidos
                </h2>

                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div key={item._id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.productId.productImage[0]}
                        alt={item.productId.productName}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.productId.productName}
                        </h3>
                        <p className="text-gray-600 text-sm capitalize">
                          {item.productId.category} • {item.productId.brandName}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-600">
                            Cantidad: {item.quantity}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {displayINRCurrency(item.productId.sellingPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximos pasos */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Próximos Pasos
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaEnvelope className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Confirmación por Email</h3>
                      <p className="text-gray-600 text-sm">
                        Recibirás un email de confirmación con todos los detalles de tu pedido.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <FaTruck className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Preparación del Pedido</h3>
                      <p className="text-gray-600 text-sm">
                        Estamos preparando tu pedido. Te notificaremos cuando esté listo para envío.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaTruck className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Envío</h3>
                      <p className="text-gray-600 text-sm">
                        Tu pedido será enviado y recibirás un número de seguimiento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel lateral */}
            <div className="lg:col-span-1 space-y-6">
              {/* Acciones rápidas */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>

                <div className="space-y-3">
                  <button
                    onClick={handleDownloadReceipt}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaDownload className="h-4 w-4" />
                    <span>Descargar Recibo</span>
                  </button>

                  <button
                    onClick={handleShareOrder}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaShare className="h-4 w-4" />
                    <span>Compartir Pedido</span>
                  </button>
                </div>
              </div>

              {/* Seguimiento */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Seguimiento</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estado actual:</span>
                    <span className="text-green-600 font-semibold">Confirmado</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tiempo estimado:</span>
                    <span className="text-gray-900 font-semibold">3-5 días hábiles</span>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Ver Estado Detallado
                  </button>
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Te puede interesar</h3>

                <div className="space-y-3">
                  <Link
                    to="/product-category"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FaShoppingBag className="h-4 w-4" />
                    <span>Seguir Comprando</span>
                  </Link>

                  <Link
                    to="/profile/orders"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FaTruck className="h-4 w-4" />
                    <span>Mis Pedidos</span>
                  </Link>

                  <Link
                    to="/profile/wishlist"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FaShoppingBag className="h-4 w-4" />
                    <span>Lista de Deseos</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción principales */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaHome className="h-4 w-4" />
              <span>Volver al Inicio</span>
            </Link>

            <Link
              to="/product-category"
              className="flex items-center justify-center space-x-2 px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaShoppingBag className="h-4 w-4" />
              <span>Seguir Comprando</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
