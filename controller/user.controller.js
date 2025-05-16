const User = require("../model/user.model")
const { createJWT } = require("../utils/jwt")
const cloudinary = require("../utils/cloudinary")


module.exports.register = async (req, res) => {
    let { name, email, password } = req.body;


    if (!name || !email || !password || !req.file) {
        console.log("req.file", req.file)
        return res.status(400).json({ success: false, message: "All fields are required!" })
    }
    try {
        const imageData = await cloudinary.uploader.upload(req.file.path)
        let user = await User.findOne({ email: email })
        if (user) {
            return res.status(400).json({ success: false, message: "Email already exixts!" })
        }
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
        //genarate token

        let token = createJWT(user._id, user.name, user.email, user.profilePic, user.isAdmin)

        res.status(200).json({ success: true, message: `Login Successfull `, token })

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: error })
    }
}
module.exports.profile = async (req, res) => {
    res.status(200).json({ success: true,message:"Profile Found", User:req.user })
}