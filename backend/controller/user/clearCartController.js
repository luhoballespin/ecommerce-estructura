const addToCartModel = require("../../models/cartProduct")

const clearCartController = async (req, res) => {
  try {
    const currentUserId = req.userId

    // Eliminar todos los productos del carrito del usuario actual
    const deleteResult = await addToCartModel.deleteMany({ userId: currentUserId })

    console.log(`Cart cleared for user ${currentUserId}. Deleted ${deleteResult.deletedCount} items.`)

    res.json({
      message: "Cart cleared successfully",
      error: false,
      success: true,
      data: {
        deletedCount: deleteResult.deletedCount,
        userId: currentUserId
      }
    })

  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({
      message: err?.message || "Error clearing cart",
      error: true,
      success: false
    })
  }
}

module.exports = clearCartController
