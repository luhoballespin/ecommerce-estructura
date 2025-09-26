import SummaryApi from "../common"
import { toast } from 'react-toastify'

const addToCart = async (e, id, quantity = 1, user = null) => {
    e?.stopPropagation()
    e?.preventDefault()

    // Debug logs
    console.log('addToCart helper - called with:', { id, quantity, user });

    // Verificar si el usuario está autenticado: token O usuario en Redux
    const token = localStorage.getItem('token')
    console.log('addToCart helper - token:', !!token);
    console.log('addToCart helper - user._id:', user?._id);

    if (!token && !user?._id) {
        console.log('addToCart helper - No token and no user');
        toast.error('Debes iniciar sesión para agregar productos al carrito')
        // Opcional: redirigir al login
        setTimeout(() => {
            window.location.href = '/login'
        }, 1500)
        return { success: false, error: 'Usuario no autenticado' }
    }

    try {
        // Si no hay token pero hay usuario, mostrar mensaje informativo
        if (!token && user?._id) {
            toast.info('Para agregar productos al carrito, necesitas iniciar sesión nuevamente')
            setTimeout(() => {
                window.location.href = '/login'
            }, 1500)
            return { success: false, error: 'Token requerido para agregar al carrito' }
        }

        const response = await fetch(SummaryApi.addToCartProduct.url, {
            method: SummaryApi.addToCartProduct.method,
            credentials: 'include',
            headers: {
                "Content-Type": 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: id,
                quantity: quantity
            })
        })

        const responseData = await response.json()

        if (responseData.success) {
            toast.success(responseData.message || 'Producto agregado al carrito')
            return { success: true, data: responseData.data }
        } else {
            toast.error(responseData.message || 'Error al agregar al carrito')
            return { success: false, error: responseData.message }
        }
    } catch (error) {
        console.error('Error adding to cart:', error)
        toast.error('Error de conexión')
        return { success: false, error: 'Error de conexión' }
    }
}


export default addToCart