import './App.css';
import { Outlet } from 'react-router-dom';
import ProfessionalHeader from './components/ProfessionalHeader';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import SummaryApi from './common';
import Context from './context';
import { useDispatch } from 'react-redux';
import { setUserDetails } from './store/userSlice';
import clearCart from './helpers/clearCart';

function App() {
  const dispatch = useDispatch()
  const [cartProductCount, setCartProductCount] = useState(0)

  const fetchUserDetails = async () => {
    try {
      // Primero verificar si hay un token en localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        // Intentar cargar usuario desde localStorage si existe
        const userFromStorage = localStorage.getItem('user');
        if (userFromStorage) {
          try {
            const parsedUser = JSON.parse(userFromStorage);
            console.log('Loading user from localStorage:', parsedUser);
            dispatch(setUserDetails(parsedUser));
          } catch (error) {
            console.error('Error parsing user from localStorage:', error);
          }
        }
        return;
      }

      // Verificar si ya tenemos los datos del usuario en Redux
      const currentUser = dispatch.getState?.().user?.user;
      if (currentUser && currentUser._id) {
        console.log('User already loaded in Redux, skipping API call');
        return;
      }

      const dataResponse = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const dataApi = await dataResponse.json()

      if (dataApi.success) {
        dispatch(setUserDetails(dataApi.data));
      } else {
        // Si el token no es válido, limpiarlo y limpiar carrito
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        try {
          await clearCart();
        } catch (error) {
          console.warn('Error clearing cart in App.js:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      try {
        await clearCart();
      } catch (cartError) {
        console.warn('Error clearing cart in App.js error handler:', cartError);
      }
    }
  }

  const fetchUserAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartProductCount(0);
        return;
      }

      const dataResponse = await fetch(SummaryApi.addToCartProductCount.url, {
        method: SummaryApi.addToCartProductCount.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const dataApi = await dataResponse.json()

      if (dataApi.success) {
        setCartProductCount(dataApi?.data?.count || 0)
      } else {
        setCartProductCount(0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartProductCount(0);
    }
  }

  // Función para refrescar el carrito completo
  const refreshCart = async () => {
    try {
      await fetchUserAddToCart();
      // Disparar evento personalizado para que otros componentes se actualicen
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  }

  useEffect(() => {
    /**user Details */
    fetchUserDetails()
    /**user Details cart product */
    fetchUserAddToCart()

    // Listener para detectar cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'token' && e.newValue) {
        console.log('Token detected in localStorage, fetching user details');
        fetchUserDetails();
        fetchUserAddToCart(); // También actualizar contador del carrito
      } else if (e.key === 'token' && !e.newValue) {
        // Token removido, limpiar contador
        setCartProductCount(0);
      }
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);

    // Escuchar evento personalizado de login exitoso
    const handleUserLogin = (event) => {
      console.log('User login event received:', event.detail);
      const { user, token } = event.detail;
      if (user && token) {
        // Actualizar Redux directamente con los datos del usuario
        dispatch(setUserDetails(user));
        console.log('User state updated in Redux');
        // Actualizar contador del carrito
        fetchUserAddToCart();
      }
    };

    window.addEventListener('userLogin', handleUserLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, [])
  return (
    <>
      <Context.Provider value={{
        fetchUserDetails, // user detail fetch 
        cartProductCount, // current user add to cart product count,
        fetchUserAddToCart,
        setCartProductCount, // Para que otros componentes puedan actualizar el contador
        refreshCart // Función para refrescar el carrito completo
      }}>
        <ToastContainer
          position='top-center'
        />

        <ProfessionalHeader />
        <main className='min-h-[calc(100vh-80px)]'>
          <Outlet />
        </main>
        <Footer />
      </Context.Provider>
    </>
  );
}

export default App;
