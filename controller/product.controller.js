const product = require('../model/product.model');
const cloudinary = require('../utils/cloudinary');
const streamUpload = require('../middleware/streamifier')


module.exports.createProduct = async (req, res) => {
    const { name, description, price, category, inStock, rating } = req.body;
    if (!name || !description || !price || !category || !inStock || !req.file) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }
    try {
        const imageData = await streamUpload(req.file.buffer);
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
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
}
module.exports.getAllProducts = async (req, res) => {
    try {
        let query = {};

        if (req.query.category) {
            query.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
        }

        if (req.query.brand) {
            query.name = { $regex: new RegExp(req.query.brand, 'i') };
        }

        const total = await product.countDocuments(query);
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || total || 8; // default limit to 8 if total is 0 to avoid limit=0

        if (page < 1) page = 1;
        if (limit < 1) limit = 8;

        const skip = (page - 1) * limit;

        // Fetch paginated products sorted by 'name' in ascending order
        const products = await product.find(query)
            .sort({ name: 1 })  // 1 for ascending, -1 for descending
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: products,
            total,
            page,
            limit,
            hasMore: skip + products.length < total
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
}

module.exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await product.aggregate([{ $sample: { size: 8 } }]);

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error("Error fetching featured products:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
}

module.exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const productData = await product.findById(id);
        if (!productData) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, productData });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
}
module.exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, inStock, rating } = req.body;
    try {
        const productData = await product.findById(id);
        if (!productData) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        let imageUrl = productData.image;
        if (req.file && req.file.buffer) {
            const image = await streamUpload(req.file.buffer);
            imageUrl = image.secure_url;
        }

        const updatedProduct = await product.findByIdAndUpdate(id, {
            name,
            description,
            price,
            category,
            inStock,
            rating,
            image: imageUrl
        }, { new: true });
        res.status(200).json({ success: true, message: "Product updated successfully", updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Internal server problem", error });
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
        res.status(500).json({ success: false, message: "Internal server problem", error });
    }
}
