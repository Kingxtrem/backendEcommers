const express = require("express")
const { register, login, profile, AddToCart, RemoveFromCart, Removeonequantity, Addonequantity } = require("../controller/user.controller")
const { isvaliduser } = require("../middleware/verifyJWT")
const upload= require("../middleware/multer")
const router = express.Router()

router.post("/register",upload.single("profilePic"), register)
router.post("/login",upload.none(), login)
router.get("/profile",isvaliduser,profile)
router.post("/addtocart",isvaliduser,AddToCart)
router.post("/removefromcart",isvaliduser,RemoveFromCart)
router.post("/removeonequantity",isvaliduser,Removeonequantity)
router.post("/addonequantity",isvaliduser,Addonequantity)

module.exports = router