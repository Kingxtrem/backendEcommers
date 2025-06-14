const User = require("../model/user.model")
const { createJWT } = require("../utils/jwt")
const cloudinary = require("../utils/cloudinary")
const streamUpload = require('../middleware/steamifier')

module.exports.register = async (req, res) => {
    let { name, email, password } = req.body;


    if (!name || !email || !password || !req.file) {
        return res.status(400).json({ success: false, message: "All fields are required!" })
    }
    try {
        let user = await User.findOne({ email: email })
        if (user) {
            return res.status(400).json({ success: false, message: "Email already exixts!" })
        }
         const imageData = await streamUpload(req.file.buffer);

        user = await User.create({
            name: name,
            email: email,
            password: password,
            profilePic: imageData.secure_url,
        })
        res.status(201).json({ success: true, message: `${user.name} Registration Successfull` })
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ success: false, message: "Internal server problem" })
    }
}
module.exports.login = async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required!" })
    }
    try {
        let user = await User.findOne({ email: email })
        if (!user) {

            return res.status(400).json({ success: false, message: "User not registered!" })
        }
        let isPasswordMatched = await user.matchPassword(password)

        if (!isPasswordMatched) {

            return res.status(400).json({ success: false, message: "Incorrect Password!" })
        }

        let token = createJWT(user._id, user.isAdmin)

        res.status(200).json({ success: true, message: `Login Successfull `, token })

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: error })
    }
}

module.exports.profile = async (req, res) => {
    try {
        let user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" })
        }
        return res.status(200).json({ success: true, message: "User found", user })
    }
    catch (error) {
        console.error("Error during profile retrieval:", error);
        res.status(500).json({ success: false, message: "Internal server problem" })
    }
}

module.exports.AddToCart = async (req, res) => {
    let { cart } = req.body;
    if (!cart) {
        return res.status(404).json({ success: false, message: "No cart items found!" });
    }
    try {
        let user = await User.findById(req.user._id);
        const existingItem = user.cart.find(item => item.product_id.toString() === cart.product_id);

        if (existingItem) {
            existingItem.quantity = cart.quantity + existingItem.quantity;
            user.markModified("cart");
            await user.save();
            return res.status(200).json({ success: true, message: "Cart updated successfully", user });
        }
        user.cart.push(cart);
        await user.save();
        res.status(200).json({ success: true, message: "Cart updated successfully", user });
    } catch (error) {
        console.error("Error during cart update:", error);
        res.status(500).json({ success: false, message: error.message || error });
    }
}

module.exports.RemoveFromCart = async (req, res) => {
    let { product_id } = req.body
    if (!product_id) {
        return res.status(404).json({ success: false, message: "No cart items found!" })
    }
    try {
        let user = await User.findById(req.user._id)
        
        user.cart = user.cart.filter(item => item.product_id.toString() !== product_id);
        if (user.cart.length === 0) {
            user.cart = [];
        }

        user.markModified("cart");
        await user.save()
        res.status(200).json({ success: true, message: "Cart updated successfully", user })
    } catch (error) {
        console.error("Error during cart update:", error);
        res.status(500).json({ success: false, message: error })
    }
}

module.exports.Removeonequantity = async (req, res) => {
    let { product_id } = req.body
    if (!product_id) {
        return res.status(404).json({ success: false, message: "No cart items found!" })
    }
    try {
        let user = await User.findById(req.user._id)
        const itemIndex = user.cart.findIndex(item => item.product_id.toString() === product_id);

        const item = user.cart[itemIndex];

        if (item.quantity === 1) {
            user.cart.splice(itemIndex, 1);
        } else {
            item.quantity -= 1;
        }

        user.markModified("cart");
        await user.save()
        res.status(200).json({ success: true, message: "Cart updated successfully", user })
    } catch (error) {
        console.error("Error during cart update:", error);
        res.status(500).json({ success: false, message: error })
    }
}

module.exports.Addonequantity = async (req, res) => {
    let { product_id } = req.body
    if (!product_id) {
        return res.status(404).json({ success: false, message: "No cart items found!" })
    }
    try {
        let user = await User.findById(req.user._id)
        const itemIndex = user.cart.findIndex(item => item.product_id.toString() === product_id);

        const item = user.cart[itemIndex];

        item.quantity += 1;

        user.markModified("cart");
        await user.save()
        res.status(200).json({ success: true, message: "Cart updated successfully", user })
    } catch (error) {
        console.error("Error during cart update:", error);
        res.status(500).json({ success: false, message: error })
    }
}