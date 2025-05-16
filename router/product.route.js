const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controller/product.controller');
const { isvaliduser, isAdmin } = require('../middleware/verifyJWT');
const upload = require('../middleware/multer');
const router = express.Router();
// Create a new product
router.post('/create', isvaliduser, isAdmin, upload.single('image'), createProduct);
// Get all products
router.get('/all', getAllProducts);
// Get a product by ID
router.get('/:id', getProductById);
// Update a product by ID
router.put('/update/:id', isvaliduser, isAdmin, upload.single('image'), updateProduct);
// Delete a product by ID
router.delete('/delete/:id', isvaliduser, isAdmin, deleteProduct);

module.exports = router;
