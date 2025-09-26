import SummaryApi from "../common";

const clearCart = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No hay token para limpiar carrito');
      return { success: true };
    }

    const response = await fetch(SummaryApi.clearCart.url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const responseData = await response.json();
    console.log('Cart cleared:', responseData);

    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: error.message };
  }
};

export default clearCart;
