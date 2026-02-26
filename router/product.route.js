const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getFeaturedProducts } = require('../controller/product.controller');
const { isValidUser, isAdmin } = require('../middleware/verifyJWT');
const upload = require('../middleware/multer');
const router = express.Router();
router.post('/create', isValidUser, isAdmin, upload.single('image'), createProduct);
router.get('/all', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.put('/update/:id', isValidUser, isAdmin, upload.single('image'), updateProduct);
router.delete('/delete/:id', isValidUser, isAdmin, deleteProduct);

module.exports = router;
