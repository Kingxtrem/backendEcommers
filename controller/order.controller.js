const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../model/order.model");
const Cart = require("../model/cart.model");
const Product = require("../model/product.model");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        // 1. Fetch user's cart securely from the DB
        const cart = await Cart.findOne({ user_id: req.user._id }).populate('items.product_id');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // 2. Mathematically rebuild order details from backend sources of truth
        let totalAmount = 0;
        const orderItems = cart.items.filter(item => item.product_id).map(item => {
            totalAmount += item.product_id.price * item.quantity;
            return {
                product_id: item.product_id._id,
                name: item.product_id.name,
                price: item.product_id.price,
                image: item.product_id.image,
                quantity: item.quantity
            };
        });

        // 3. Razorpay Options (amount is in smallest currency unit / paise)
        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);
        if (!razorpayOrder) {
            return res.status(500).json({ success: false, message: "Failed to initialize payment gateway" });
        }

        // 4. Temporarily stash the pending transaction internally
        const newOrder = await Order.create({
            user_id: req.user._id,
            items: orderItems,
            totalAmount,
            shippingAddress: shippingAddress || {},
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "Pending"
        });

        res.status(200).json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            keyId: process.env.RAZORPAY_KEY_ID,
            platformOrderId: newOrder._id
        });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
};

module.exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification attributes missing." });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment logic authenticated securely natively
            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { paymentStatus: "Completed", razorpayPaymentId: razorpay_payment_id },
                { new: true }
            );

            if (order) {
                // Clear the cart logic natively after successful transaction!
                await Cart.findOneAndUpdate(
                    { user_id: req.user._id },
                    { items: [] }
                );

                return res.status(200).json({ success: true, message: "Payment verified successfully" });
            } else {
                return res.status(404).json({ success: false, message: "Order not found internally." });
            }
        } else {
            // Bad Hash
            await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { paymentStatus: "Failed" }
            );
            return res.status(400).json({ success: false, message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
};

module.exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
};

module.exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ _id: orderId, user_id: req.user._id });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found or unauthorized" });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
};
