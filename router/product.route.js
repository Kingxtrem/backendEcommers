const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controller/product.controller');
const { isvaliduser, isAdmin } = require('../middleware/verifyJWT');
const upload = require('../middleware/multer');
const router = express.Router();
router.post('/create', isvaliduser, isAdmin, upload.single('image'), createProduct);
router.get('/all', getAllProducts);
router.get('/:id', getProductById);
router.put('/update/:id', isvaliduser, isAdmin, upload.single('image'), updateProduct);
router.delete('/delete/:id', isvaliduser, isAdmin, deleteProduct);

module.exports = router;
