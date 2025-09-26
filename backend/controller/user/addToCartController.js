const addToCartModel = require("../../models/cartProduct")

const addToCartController = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req?.body
        const currentUser = req.userId

        // Buscar si el producto ya existe en el carrito del usuario actual
        const existingCartItem = await addToCartModel.findOne({
            productId: productId,
            userId: currentUser
        })

        console.log("existingCartItem   ", existingCartItem)

        if (existingCartItem) {
            // Si el producto ya existe, incrementar la cantidad
            const newQuantity = existingCartItem.quantity + quantity

            const updatedItem = await addToCartModel.findByIdAndUpdate(
                existingCartItem._id,
                { quantity: newQuantity },
                { new: true }
            )

            return res.json({
                data: updatedItem,
                message: `Product quantity increased to ${newQuantity}`,
                success: true,
                error: false
            })
        } else {
            // Si el producto no existe, crear un nuevo item
            const payload = {
                productId: productId,
                quantity: quantity,
                userId: currentUser,
            }

            const newAddToCart = new addToCartModel(payload)
            const saveProduct = await newAddToCart.save()

            return res.json({
                data: saveProduct,
                message: "Product Added in Cart",
                success: true,
                error: false
            })
        }

    } catch (err) {
        console.error('Error in addToCartController:', err);
        res.json({
            message: err?.message || err,
            error: true,
            success: false
        })
    }
}


module.exports = addToCartController