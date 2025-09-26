import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { FaCreditCard, FaLock, FaSpinner } from 'react-icons/fa';

// Configurar Stripe con validación
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

// Componente del formulario de pago
const PaymentForm = ({
  amount,
  onSuccess,
  onError,
  orderId,
  customerInfo
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Si Stripe no está configurado, mostrar mensaje
  if (!stripePromise) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-center">
          <FaCreditCard className="mx-auto text-4xl text-yellow-600 mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Pagos Temporalmente No Disponibles
          </h3>
          <p className="text-yellow-700 mb-4">
            Los pagos con tarjeta están temporalmente deshabilitados.
            Por favor, selecciona otro método de pago.
          </p>
          <button
            onClick={() => onError(new Error('Stripe no configurado'))}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Continuar con Otro Método
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setLoading(true);

    try {
      // Crear payment intent
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/payments/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: amount,
          currency: 'ars',
          orderId: orderId,
          customerInfo: customerInfo
        })
      });

      const { clientSecret, paymentIntentId } = await response.json();

      if (!response.ok) {
        throw new Error('Error al crear el intent de pago');
      }

      // Confirmar pago con Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: customerInfo?.firstName + ' ' + customerInfo?.lastName,
            email: customerInfo?.email,
            phone: customerInfo?.phone,
            address: {
              line1: customerInfo?.shippingAddress?.street,
              city: customerInfo?.shippingAddress?.city,
              state: customerInfo?.shippingAddress?.state,
              postal_code: customerInfo?.shippingAddress?.zipCode,
              country: customerInfo?.shippingAddress?.country || 'US'
            }
          }
        }
      });

      if (error) {
        console.error('Error:', error);
        toast.error(`Error en el pago: ${error.message}`);
        onError(error);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirmar pago en el backend
        const confirmResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/payments/stripe/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            orderId: orderId
          })
        });

        if (confirmResponse.ok) {
          toast.success('¡Pago procesado exitosamente!');
          onSuccess(paymentIntent);
        } else {
          throw new Error('Error al confirmar el pago');
        }
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      toast.error('Error al procesar el pago. Por favor, inténtalo de nuevo.');
      onError(error);
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Información de la Tarjeta
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FaLock className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900">Pago Seguro</h4>
            <p className="text-sm text-blue-700 mt-1">
              Tu información está protegida con encriptación de nivel bancario.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {processing ? (
          <>
            <FaSpinner className="h-4 w-4 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <FaCreditCard className="h-4 w-4" />
            <span>Pagar ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Al continuar, aceptas nuestros términos de servicio y política de privacidad.
      </p>
    </form>
  );
};

// Componente principal con Elements
const StripePaymentForm = ({
  amount,
  onSuccess,
  onError,
  orderId,
  customerInfo
}) => {
  // Si Stripe no está configurado, mostrar el mensaje directamente
  if (!stripePromise) {
    return (
      <PaymentForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        orderId={orderId}
        customerInfo={customerInfo}
      />
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
        orderId={orderId}
        customerInfo={customerInfo}
      />
    </Elements>
  );
};

export default StripePaymentForm;
