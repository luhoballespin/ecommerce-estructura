import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaHistory,
  FaEye,
  FaTruck,
  FaCreditCard,
  FaCalendarAlt,
  FaBox,
  FaArrowLeft,
  FaFilter,
  FaSearch,
  FaDownload,
  FaStar,
  FaRedo,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import displayINRCurrency from '../../helpers/displayCurrency';

const OrderHistory = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector(state => state?.user?.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Verificar autenticación y cargar pedidos del usuario
  useEffect(() => {
    const token = localStorage.getItem('token');

    // Verificar si hay token O si hay usuario en Redux
    if (!token && !reduxUser?._id) {
      console.log('No hay token ni usuario en Redux para acceder al historial');
      toast.error('Debes iniciar sesión para ver tu historial de pedidos');
      navigate('/login');
      return;
    }

    // Si hay usuario en Redux pero no hay token, intentar cargar de todas formas
    if (!token && reduxUser?._id) {
      console.log('Usuario en Redux pero sin token, cargando historial...');
    }

    console.log('Usuario autenticado, cargando historial de pedidos...');
    fetchOrders();
  }, [navigate, reduxUser, filterStatus, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Simular datos de pedidos (en producción, esto vendría del backend)
      const mockOrders = [
        {
          _id: '1',
          orderNumber: 'ORD-001',
          createdAt: '2024-09-20T10:30:00Z',
          status: 'delivered',
          total: 89.99,
          items: [
            {
              productId: {
                _id: '1',
                productName: 'iPhone 14 Pro',
                productImage: ['https://via.placeholder.com/100x100'],
                sellingPrice: 89.99
              },
              quantity: 1
            }
          ],
          shippingAddress: {
            street: 'Av. Principal 123',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '01000'
          },
          payment: {
            method: 'credit_card',
            status: 'completed'
          },
          trackingNumber: 'TRK123456789'
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          createdAt: '2024-09-15T14:20:00Z',
          status: 'shipped',
          total: 156.50,
          items: [
            {
              productId: {
                _id: '2',
                productName: 'Laptop Gaming ASUS',
                productImage: ['https://via.placeholder.com/100x100'],
                sellingPrice: 156.50
              },
              quantity: 1
            }
          ],
          shippingAddress: {
            street: 'Av. Principal 123',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '01000'
          },
          payment: {
            method: 'credit_card',
            status: 'completed'
          },
          trackingNumber: 'TRK987654321'
        },
        {
          _id: '3',
          orderNumber: 'ORD-003',
          createdAt: '2024-09-10T09:15:00Z',
          status: 'processing',
          total: 45.99,
          items: [
            {
              productId: {
                _id: '3',
                productName: 'Auriculares Bluetooth',
                productImage: ['https://via.placeholder.com/100x100'],
                sellingPrice: 45.99
              },
              quantity: 1
            }
          ],
          shippingAddress: {
            street: 'Av. Principal 123',
            city: 'Ciudad de México',
            state: 'CDMX',
            zipCode: '01000'
          },
          payment: {
            method: 'paypal',
            status: 'completed'
          }
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar el historial de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pendiente',
          color: 'bg-yellow-100 text-yellow-800',
          icon: FaBox
        };
      case 'processing':
        return {
          label: 'Procesando',
          color: 'bg-blue-100 text-blue-800',
          icon: FaBox
        };
      case 'shipped':
        return {
          label: 'Enviado',
          color: 'bg-purple-100 text-purple-800',
          icon: FaTruck
        };
      case 'delivered':
        return {
          label: 'Entregado',
          color: 'bg-green-100 text-green-800',
          icon: FaBox
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: 'bg-red-100 text-red-800',
          icon: FaBox
        };
      default:
        return {
          label: 'Desconocido',
          color: 'bg-gray-100 text-gray-800',
          icon: FaBox
        };
    }
  };

  const getPaymentMethodInfo = (method) => {
    switch (method) {
      case 'credit_card':
        return { label: 'Tarjeta de Crédito', icon: FaCreditCard };
      case 'debit_card':
        return { label: 'Tarjeta de Débito', icon: FaCreditCard };
      case 'paypal':
        return { label: 'PayPal', icon: FaCreditCard };
      case 'cash_on_delivery':
        return { label: 'Contra Entrega', icon: FaBox };
      default:
        return { label: 'Desconocido', icon: FaCreditCard };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item =>
        item.productId.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'total_high':
        return b.total - a.total;
      case 'total_low':
        return a.total - b.total;
      default:
        return 0;
    }
  });

  const handleReorder = (order) => {
    toast.success('Productos agregados al carrito para reordenar');
    // Aquí se implementaría la lógica para agregar los productos al carrito
  };

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleTrackOrder = (trackingNumber) => {
    if (trackingNumber) {
      // Aquí se abriría el tracking del pedido
      toast.info(`Rastreando pedido: ${trackingNumber}`);
    } else {
      toast.warning('Número de seguimiento no disponible');
    }
  };

  const handleDownloadInvoice = (orderId) => {
    toast.success('Descargando factura...');
    // Aquí se implementaría la descarga de la factura
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial de pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Historial de Pedidos</h1>
                <p className="text-gray-600">{orders.length} pedidos encontrados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por número de pedido o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400 h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="total_high">Mayor total</option>
                <option value="total_low">Menor total</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="space-y-4">
          {sortedOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <FaHistory className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay pedidos</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'No se encontraron pedidos con los filtros aplicados.'
                  : 'Aún no has realizado ningún pedido.'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => navigate('/product-category')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Comenzar a Comprar
                </button>
              )}
            </div>
          ) : (
            sortedOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const paymentInfo = getPaymentMethodInfo(order.payment.method);
              const StatusIcon = statusInfo.icon;
              const PaymentIcon = paymentInfo.icon;

              return (
                <div key={order._id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {order.orderNumber}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Productos */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <img
                              src={item.productId.productImage[0]}
                              alt={item.productId.productName}
                              className="w-12 h-12 object-cover rounded-lg border"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {item.productId.productName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Cantidad: {item.quantity} • {displayINRCurrency(item.productId.sellingPrice)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Información adicional */}
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <PaymentIcon className="h-4 w-4 mr-2" />
                          <span>{paymentInfo.label}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                          <span>
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total y acciones */}
                    <div className="lg:text-right">
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {displayINRCurrency(order.total)}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleViewDetails(order._id)}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaEye className="h-4 w-4" />
                          <span>Ver Detalles</span>
                        </button>

                        {order.trackingNumber && (
                          <button
                            onClick={() => handleTrackOrder(order.trackingNumber)}
                            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <FaTruck className="h-4 w-4" />
                            <span>Rastrear</span>
                          </button>
                        )}

                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleReorder(order)}
                            className="flex items-center justify-center space-x-2 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            <FaRedo className="h-4 w-4" />
                            <span>Reordenar</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDownloadInvoice(order._id)}
                          className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FaDownload className="h-4 w-4" />
                          <span>Factura</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
