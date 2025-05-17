const express = require("express")
const { register, login, profile,cart, AddToCart, RemoveFromCart } = require("../controller/user.controller")
const { isvaliduser } = require("../middleware/verifyJWT")
const upload= require("../middleware/multer")
const router = express.Router()

router.post("/register",upload.single("profilePic"), register)
router.post("/login",upload.none(), login)
router.get("/profile",isvaliduser,profile)
router.post("/addtocart",isvaliduser,AddToCart)
router.post("/removefromcart",isvaliduser,RemoveFromCart)

module.exports = router