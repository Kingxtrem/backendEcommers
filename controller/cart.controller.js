const Cart = require("../model/cart.model");
const Product = require("../model/product.model");

// Helper function to fetch cart and format it for the frontend
const getPopulatedCart = async (userId) => {
    let cart = await Cart.findOne({ user_id: userId }).populate('items.product_id', 'name price image inStock');
    if (!cart) return [];

    // Map populated mongoose subdocs into flat objects expected by the frontend
    return cart.items
        .filter(item => item && item.product_id) // Filter out items where the product might have been deleted from DB first
        .map(item => ({
            product_id: item.product_id._id,
            name: item.product_id.name,
            price: item.product_id.price,
            image: item.product_id.image,
            inStock: item.product_id.inStock,
            quantity: item.quantity
        }));
};

module.exports.AddToCart = async (req, res) => {
    let { cart: inputCart } = req.body;
    if (!inputCart || !inputCart.product_id) {
        return res.status(400).json({ success: false, message: "Invalid cart data provided!" });
    }

    try {
        const product = await Product.findById(inputCart.product_id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }

        let cart = await Cart.findOne({ user_id: req.user._id });
        const requestQuantity = inputCart.quantity || 1;

        if (!cart) {
            if (requestQuantity > product.inStock) {
                return res.status(400).json({ success: false, message: `Only ${product.inStock} items left in stock` });
            }
            // Create a new cart if user doesn't have one
            cart = await Cart.create({
                user_id: req.user._id,
                items: [{ product_id: inputCart.product_id, quantity: requestQuantity }]
            });
        } else {
            // Check if product already exists in cart
            const itemIndex = cart.items.findIndex(item => item.product_id.toString() === inputCart.product_id);

            if (itemIndex > -1) {
                if (cart.items[itemIndex].quantity + requestQuantity > product.inStock) {
                    return res.status(400).json({ success: false, message: `Only ${product.inStock} items left in stock` });
                }
                cart.items[itemIndex].quantity += requestQuantity;
            } else {
                if (requestQuantity > product.inStock) {
                    return res.status(400).json({ success: false, message: `Only ${product.inStock} items left in stock` });
                }
                cart.items.push({ product_id: inputCart.product_id, quantity: requestQuantity });
            }
            await cart.save();
        }

        // Deduct globally from inventory
        await Product.updateOne(
            { _id: product._id },
            { $inc: { inStock: -requestQuantity } }
        );

        const formattedCart = await getPopulatedCart(req.user._id);
        res.status(200).json({ success: true, message: "Cart updated successfully", user: { cart: formattedCart } });
    } catch (error) {
        console.error("Error during AddToCart:", error);
        res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

module.exports.RemoveFromCart = async (req, res) => {
    let { product_id } = req.body;
    if (!product_id) {
        return res.status(400).json({ success: false, message: "Product ID is missing!" });
    }

    try {
        const cart = await Cart.findOne({ user_id: req.user._id });
        if (cart) {
            const item = cart.items.find(i => i.product_id.toString() === product_id);
            if (item) {
                // Restore globally back to inventory
                await Product.updateOne(
                    { _id: product_id },
                    { $inc: { inStock: item.quantity } }
                );

                await Cart.findOneAndUpdate(
                    { user_id: req.user._id },
                    { $pull: { items: { product_id: product_id } } }
                );
            }
        }

        const formattedCart = await getPopulatedCart(req.user._id);
        res.status(200).json({ success: true, message: "Item removed from cart", user: { cart: formattedCart } });
    } catch (error) {
        console.error("Error during RemoveFromCart:", error);
        res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

module.exports.Removeonequantity = async (req, res) => {
    let { product_id } = req.body;
    if (!product_id) {
        return res.status(400).json({ success: false, message: "Product ID is missing!" });
    }

    try {
        const cart = await Cart.findOne({ user_id: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found!" });

        const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id);
        if (itemIndex > -1) {
            if (cart.items[itemIndex].quantity <= 1) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity -= 1;
            }
            await cart.save();

            // Restore globally back to inventory
            await Product.updateOne(
                { _id: product_id },
                { $inc: { inStock: 1 } }
            );
        }

        const formattedCart = await getPopulatedCart(req.user._id);
        res.status(200).json({ success: true, message: "Cart updated successfully", user: { cart: formattedCart } });
    } catch (error) {
        console.error("Error during Removeonequantity:", error);
        res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

module.exports.Addonequantity = async (req, res) => {
    let { product_id } = req.body;
    if (!product_id) {
        return res.status(400).json({ success: false, message: "Product ID is missing!" });
    }

    try {
        const product = await Product.findById(product_id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found!" });

        const cart = await Cart.findOne({ user_id: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found!" });

        const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id);

        if (itemIndex > -1) {
            if (cart.items[itemIndex].quantity + 1 > product.inStock) {
                return res.status(400).json({ success: false, message: `Only ${product.inStock} items left in stock` });
            }
            cart.items[itemIndex].quantity += 1;
            await cart.save();

            // Deduct globally from inventory
            await Product.updateOne(
                { _id: product._id },
                { $inc: { inStock: -1 } }
            );
        } else {
            return res.status(404).json({ success: false, message: "Item not found in cart!" });
        }

        const formattedCart = await getPopulatedCart(req.user._id);
        res.status(200).json({ success: true, message: "Cart updated successfully", user: { cart: formattedCart } });
    } catch (error) {
        console.error("Error during Addonequantity:", error);
        res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

module.exports.getPopulatedCart = getPopulatedCart;
