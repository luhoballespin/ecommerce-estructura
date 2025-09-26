import React, { useState } from 'react';
import { FaShoppingCart, FaSpinner, FaCheck, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import addToCart from '../helpers/addToCart';
import Context from '../context';

const AddToCartButton = ({
  productId,
  className = '',
  children,
  disabled = false,
  onSuccess = null,
  showIcon = true,
  variant = 'primary' // primary, secondary, outline
}) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const user = useSelector(state => state?.user?.user);
  const navigate = useNavigate();
  const context = React.useContext(Context);

  const handleAddToCart = async (e) => {
    if (loading || disabled) return;

    // Debug logs
    console.log('AddToCartButton - handleAddToCart called');
    console.log('AddToCartButton - user:', user);
    console.log('AddToCartButton - user._id:', user?._id);

    // Verificar autenticación: token O usuario en Redux
    const token = localStorage.getItem('token');
    console.log('AddToCartButton - token:', !!token);

    if (!token && !user?._id) {
      console.log('AddToCartButton - No token and no user, redirecting to login');
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    setLoading(true);
    setAdded(false);

    try {
      const result = await addToCart(e, productId, 1, user);

      if (result.success) {
        setAdded(true);
        if (onSuccess) onSuccess(result.data);

        // Actualizar contador del carrito
        if (context.refreshCart) {
          context.refreshCart();
        }

        // Reset added state after 2 seconds
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (error) {
      console.error('Error in AddToCartButton:', error);
      toast.error('Error al agregar producto al carrito');
    } finally {
      setLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    switch (variant) {
      case 'secondary':
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 ${className}`;
      case 'outline':
        return `${baseClasses} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 ${className}`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ${className}`;
    }
  };

  const getIcon = () => {
    if (loading) {
      return <FaSpinner className="h-4 w-4 animate-spin" />;
    }
    if (added) {
      return <FaCheck className="h-4 w-4" />;
    }
    const token = localStorage.getItem('token');
    if (!user?._id || (!token && user?._id)) {
      return <FaLock className="h-4 w-4" />;
    }
    if (showIcon) {
      return <FaShoppingCart className="h-4 w-4" />;
    }
    return null;
  };

  const getText = () => {
    if (loading) return 'Agregando...';
    if (added) return '¡Agregado!';
    const token = localStorage.getItem('token');
    if (!user?._id) return 'Inicia Sesión';
    if (!token && user?._id) return 'Reinicia Sesión';
    return children || 'Agregar al Carrito';
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || disabled}
      className={getButtonClasses()}
    >
      {getIcon() && (
        <span className="mr-2">
          {getIcon()}
        </span>
      )}
      {getText()}
    </button>
  );
};

export default AddToCartButton;
