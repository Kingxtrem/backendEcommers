const express = require("express")
const { register, login, profile } = require("../controller/user.controller")
const { AddToCart, RemoveFromCart, Removeonequantity, Addonequantity } = require("../controller/cart.controller")
const { isValidUser } = require("../middleware/verifyJWT")
const upload = require("../middleware/multer")
const router = express.Router()

router.post("/register", upload.single("profilePic"), register)
router.post("/login", upload.none(), login)
router.get("/profile", isValidUser, profile)
router.post("/addtocart", isValidUser, AddToCart)
router.post("/removefromcart", isValidUser, RemoveFromCart)
router.post("/removeonequantity", isValidUser, Removeonequantity)
router.post("/addonequantity", isValidUser, Addonequantity)

module.exports = router