const product= require('../model/product.model');
const cloudinary = require('../utils/cloudinary');

module.exports.createProduct = async (req, res) => {
    const { name, description, price, category, inStock ,rating} = req.body;
    if (!name || !description || !price || !category || !inStock || !req.file) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }
    try {
        const imageData = await cloudinary.uploader.upload(req.file.path);
        const newProduct = await product.create({
            name,
            description,
            price,
            category,
            inStock,
            rating,
            image: imageData.secure_url
        });
        res.status(201).json({ success: true, message: "Product created successfully", newProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Internal server problem" });
    }
}
module.exports.getAllProducts = async (req, res) => {
    try {
        const products = await product.find();
        res.status(200).json({ success: true, [products] });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Internal server problem" });
    }
}
module.exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const productData = await product.findOne(id);
        if (!productData) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, productData });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Internal server problem" });
    }
}
module.exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, inStock ,rating} = req.body;
    try {
        const productData = await product.findOne(id);
        if (!productData) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        const updatedProduct = await product.findByIdAndUpdate(id, {
            name,
            description,
            price,
            category,
            inStock,
            rating
        }, { new: true });
        res.status(200).json({ success: true, message: "Product updated successfully", updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Internal server problem" });
    }
}
module.exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const productData = await product.findById(id);
        if (!productData) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        await product.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Internal server problem" });
    }
}
