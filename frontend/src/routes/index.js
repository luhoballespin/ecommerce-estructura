import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import SimpleHome from '../components/SimpleHome'
import ModernLogin from '../components/auth/ModernLogin'
import ModernSignUp from '../components/auth/ModernSignUp'
import AuthSuccess from '../pages/auth/AuthSuccess'
import AuthError from '../pages/auth/AuthError'
import ForgotPassowrd from '../pages/ForgotPassowrd'

import AdminPanel from '../pages/AdminPanel'
import AllUsers from '../pages/AllUsers'
import AllProducts from '../pages/AllProducts'
import CategoryProduct from '../pages/CategoryProduct'
import ProductDetails from '../pages/ProductDetails'
import ModernCart from '../components/ModernCart'
import SearchProduct from '../pages/SearchProduct'
import Checkout from '../pages/checkout/Checkout'
import CheckoutSuccess from '../pages/checkout/CheckoutSuccess'
import UserProfile from '../pages/profile/UserProfile'
import OrderHistory from '../pages/profile/OrderHistory'

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "",
                element: <SimpleHome />
            },
            {
                path: "login",
                element: <ModernLogin />
            },
            {
                path: "auth/success",
                element: <AuthSuccess />
            },
            {
                path: "auth/error",
                element: <AuthError />
            },
            {
                path: "forgot-password",
                element: <ForgotPassowrd />
            },
            {
                path: "sign-up",
                element: <ModernSignUp />
            },
            {
                path: "product-category",
                element: <CategoryProduct />
            },
            {
                path: "product/:id",
                element: <ProductDetails />
            },
            {
                path: 'cart',
                element: <ModernCart />
            },
            {
                path: "search",
                element: <SearchProduct />
            },
            {
                path: "checkout",
                element: <Checkout />
            },
            {
                path: "checkout/success",
                element: <CheckoutSuccess />
            },
            {
                path: "profile",
                element: <UserProfile />
            },
            {
                path: "orders",
                element: <OrderHistory />
            },
            {
                path: "admin-panel",
                element: <AdminPanel />,
                children: [
                    {
                        path: "all-users",
                        element: <AllUsers />
                    },
                    {
                        path: "all-products",
                        element: <AllProducts />
                    }
                ]
            },
        ]
    }
])


export default router