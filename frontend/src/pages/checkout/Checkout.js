import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCreditCard,
  FaTruck,
  FaMapMarkerAlt,
  FaLock,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHome
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import displayINRCurrency from '../../helpers/displayCurrency';
import StripePaymentForm from '../../components/payment/StripePaymentForm';

const Checkout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Información personal
    firstName: '',
    lastName: '',
    email: '',
    phone: '',

    // Dirección de envío
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'México'
    },

    // Dirección de facturación
    billingAddress: {
      sameAsShipping: true,
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'México'
    },

    // Información de pago
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',

    // Información adicional
    notes: '',
    newsletter: false
  });

  const [errors, setErrors] = useState({});

  // Cargar datos del carrito
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.addToCartProductView.url, {
        method: SummaryApi.addToCartProductView.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();

      if (responseData.success) {
        setCartItems(responseData.data || []);
      } else {
        toast.error('Error al cargar el carrito');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Error de conexión');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  // Validación del formulario
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Información personal
        if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
        if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
        if (!formData.email.trim()) newErrors.email = 'El email es requerido';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
        if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
        break;

      case 2: // Dirección de envío
        if (!formData.shippingAddress.street.trim()) newErrors.street = 'La dirección es requerida';
        if (!formData.shippingAddress.city.trim()) newErrors.city = 'La ciudad es requerida';
        if (!formData.shippingAddress.state.trim()) newErrors.state = 'El estado es requerido';
        if (!formData.shippingAddress.zipCode.trim()) newErrors.zipCode = 'El código postal es requerido';
        break;

      case 3: // Información de pago
        if (formData.paymentMethod === 'credit_card') {
          if (!formData.cardNumber.trim()) newErrors.cardNumber = 'El número de tarjeta es requerido';
          else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
            newErrors.cardNumber = 'Número de tarjeta inválido';
          }
          if (!formData.expiryDate.trim()) newErrors.expiryDate = 'La fecha de expiración es requerida';
          if (!formData.cvv.trim()) newErrors.cvv = 'El CVV es requerido';
          else if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = 'CVV inválido';
          if (!formData.cardName.trim()) newErrors.cardName = 'El nombre en la tarjeta es requerido';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Aplicar cupón
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Ingresa un código de cupón');
      return;
    }

    // Simular aplicación de cupón
    const validCoupons = {
      'WELCOME10': { discount: 10, type: 'percentage' },
      'SAVE20': { discount: 20, type: 'percentage' },
      'FIXED50': { discount: 50, type: 'fixed' }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];

    if (coupon) {
      setAppliedCoupon(coupon);
      if (coupon.type === 'percentage') {
        setDiscount((subtotal * coupon.discount) / 100);
      } else {
        setDiscount(Math.min(coupon.discount, subtotal * 0.5));
      }
      toast.success(`Cupón aplicado: ${coupon.discount}${coupon.type === 'percentage' ? '%' : '$'} de descuento`);
    } else {
      toast.error('Código de cupón inválido');
    }
  };

  // Navegar entre pasos
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Procesar pedido
  const processOrder = async () => {
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      const orderData = {
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress.sameAsShipping
          ? formData.shippingAddress
          : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon ? couponCode : null,
        notes: formData.notes
      };

      // Crear la orden en el backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const orderResponse = await response.json();

      if (orderResponse.success) {
        // Si es pago con tarjeta, mostrar formulario de Stripe
        if (formData.paymentMethod === 'credit_card') {
          setCurrentStep(4); // Ir al paso de pago con Stripe
        } else {
          // Para otros métodos de pago, confirmar directamente
          toast.success('¡Pedido procesado exitosamente!');
          navigate('/checkout/success', {
            state: {
              orderNumber: orderResponse.data.orderNumber,
              total: total,
              items: cartItems,
              orderId: orderResponse.data._id
            }
          });
        }
      } else {
        throw new Error(orderResponse.message || 'Error al crear el pedido');
      }

    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  // Manejar éxito del pago
  const handlePaymentSuccess = (paymentIntent) => {
    toast.success('¡Pago procesado exitosamente!');
    navigate('/checkout/success', {
      state: {
        orderNumber: `ORD-${Date.now()}`,
        total: total,
        items: cartItems,
        paymentIntent: paymentIntent
      }
    });
  };

  // Manejar error del pago
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error('Error en el procesamiento del pago');
  };

  // Cálculos
  const subtotal = cartItems.reduce((total, item) => total + (item.quantity * item.productId.sellingPrice), 0);
  const shipping = subtotal > 10000 ? 0 : 1500; // Envío gratis sobre $10.000 ARS
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - discount;

  const steps = [
    { id: 1, title: 'Información Personal', icon: FaUser },
    { id: 2, title: 'Dirección de Envío', icon: FaMapMarkerAlt },
    { id: 3, title: 'Pago', icon: FaCreditCard },
    { id: 4, title: 'Confirmación', icon: FaCheckCircle }
  ];

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaTruck className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrito vacío</h2>
          <p className="text-gray-600 mb-4">Agrega productos antes de proceder al checkout</p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Carrito
          </button>
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
                onClick={() => navigate('/cart')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                <p className="text-gray-600">Completa tu compra</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2">
            {/* Indicador de pasos */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : isActive
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 text-gray-400'
                        }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                          }`}>
                          {step.title}
                        </p>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'
                          }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contenido del paso actual */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Información Personal</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Tu nombre"
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Tu apellido"
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="+52 55 1234 5678"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Dirección de Envío</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección *
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.street"
                        value={formData.shippingAddress.street}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.street ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="Calle, número, colonia"
                      />
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          name="shippingAddress.city"
                          value={formData.shippingAddress.city}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Ciudad"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado *
                        </label>
                        <input
                          type="text"
                          name="shippingAddress.state"
                          value={formData.shippingAddress.state}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="Estado"
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Código Postal *
                        </label>
                        <input
                          type="text"
                          name="shippingAddress.zipCode"
                          value={formData.shippingAddress.zipCode}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'
                            }`}
                          placeholder="12345"
                        />
                        {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <input
                        type="text"
                        name="shippingAddress.country"
                        value={formData.shippingAddress.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Información de Pago</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Método de Pago
                      </label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="credit_card">Tarjeta de Crédito</option>
                        <option value="debit_card">Tarjeta de Débito</option>
                        <option value="paypal">PayPal</option>
                        <option value="cash_on_delivery">Pago contra entrega</option>
                      </select>
                    </div>

                    {formData.paymentMethod === 'credit_card' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número de Tarjeta *
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                          />
                          {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha de Expiración *
                            </label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                }`}
                              placeholder="MM/AA"
                              maxLength="5"
                            />
                            {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CVV *
                            </label>
                            <input
                              type="text"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cvv ? 'border-red-500' : 'border-gray-300'
                                }`}
                              placeholder="123"
                              maxLength="4"
                            />
                            {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre en la Tarjeta *
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cardName ? 'border-red-500' : 'border-gray-300'
                              }`}
                            placeholder="Como aparece en la tarjeta"
                          />
                          {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas del Pedido (Opcional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Instrucciones especiales para la entrega..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Procesar Pago</h2>

                  {formData.paymentMethod === 'credit_card' ? (
                    <div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <FaCreditCard className="h-6 w-6 text-blue-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-semibold text-blue-800">Pago con Tarjeta</h3>
                            <p className="text-blue-600">Procesa tu pago de forma segura con Stripe.</p>
                          </div>
                        </div>
                      </div>

                      <StripePaymentForm
                        amount={total}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        customerInfo={formData}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                          <FaCheckCircle className="h-6 w-6 text-green-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-semibold text-green-800">¡Pedido listo para procesar!</h3>
                            <p className="text-green-600">Revisa los detalles antes de confirmar tu compra.</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Envío</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                            <p>{formData.email}</p>
                            <p>{formData.phone}</p>
                            <p className="mt-2">
                              {formData.shippingAddress.street}<br />
                              {formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.zipCode}<br />
                              {formData.shippingAddress.country}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Método de Pago</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-medium capitalize">
                              {formData.paymentMethod.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de navegación */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </button>
                )}

                <div className="ml-auto">
                  {currentStep < 4 ? (
                    <button
                      onClick={nextStep}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      onClick={processOrder}
                      disabled={loading}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <FaLock className="h-4 w-4" />
                          <span>Confirmar Pedido</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

              {/* Productos */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex space-x-3">
                    <img
                      src={item.productId.productImage[0]}
                      alt={item.productId.productName}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {item.productId.productName}
                      </h3>
                      <p className="text-gray-600 text-sm">Cantidad: {item.quantity}</p>
                      <p className="font-semibold text-gray-900">
                        {displayINRCurrency(item.productId.sellingPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cupón */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Cupón
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ingresa tu cupón"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Desglose de precios */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{displayINRCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : displayINRCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Impuestos</span>
                  <span>{displayINRCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span>-{displayINRCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{displayINRCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Seguridad */}
              <div className="flex items-center text-sm text-gray-600">
                <FaLock className="h-4 w-4 mr-2 text-green-600" />
                <span>Compra 100% segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
