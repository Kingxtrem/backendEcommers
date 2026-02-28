const User = require("../model/user.model")
const { createJWT } = require("../utils/jwt")
const cloudinary = require("../utils/cloudinary")
const streamUpload = require('../middleware/streamifier')

module.exports.register = async (req, res) => {
    let { name, email, password } = req.body;


    if (!name || !email || !password || !req.file) {
        return res.status(400).json({ success: false, message: "All fields are required!" })
    }
    try {
        let user = await User.findOne({ email: email })
        if (user) {
            return res.status(400).json({ success: false, message: "Email already exists!" })
        }
        const imageData = await streamUpload(req.file.buffer);

        user = await User.create({
            name: name,
            email: email,
            password: password,
            profilePic: imageData.secure_url,
        })
        res.status(201).json({ success: true, message: `${user.name} Registration Successful` })
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error })
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

        res.status(200).json({ success: true, message: `Login Successful`, token })

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Internal server error", error })
    }
}

const { getPopulatedCart } = require('./cart.controller');

module.exports.profile = async (req, res) => {
    try {
        let user = await User.findById(req.user._id).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const cart = await getPopulatedCart(req.user._id);
        user.cart = cart;

        return res.status(200).json({ success: true, message: "User found", user });
    } catch (error) {
        console.error("Error during profile retrieval:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
}
