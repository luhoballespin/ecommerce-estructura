const addToCartModel = require("../../models/cartProduct")

async function userLogout(req, res) {
    try {
        const currentUserId = req.userId

        // Limpiar carrito del usuario antes del logout
        if (currentUserId) {
            try {
                const deleteResult = await addToCartModel.deleteMany({ userId: currentUserId })
                console.log(`Cart cleared during logout for user ${currentUserId}. Deleted ${deleteResult.deletedCount} items.`)
            } catch (cartError) {
                console.error('Error clearing cart during logout:', cartError)
                // Continuar con logout aunque falle la limpieza del carrito
            }
        } else {
            console.warn('Logout called without userId - user may not be authenticated')
        }

        // Limpiar cookie del token
        res.clearCookie("token")

        res.json({
            message: "Logged out successfully",
            error: false,
            success: true,
            data: {
                userId: currentUserId,
                cartCleared: !!currentUserId
            }
        })
    } catch (err) {
        console.error('Error during logout:', err)
        res.json({
            message: err.message || err,
            error: true,
            success: false,
        })
    }
}


module.exports = userLogout