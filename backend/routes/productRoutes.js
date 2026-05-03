const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
<<<<<<< HEAD

const router = express.Router();

// Helper to normalize product fields
const normalize = (p) => {
    const obj = p.toObject ? p.toObject() : p;
    obj.size = obj.size || obj.sizes || [];
    obj.imageUrl = obj.imageUrl || obj.images?.[0]?.url || obj.images?.[0] || '';
    obj.countInStock = obj.countInStock ?? obj.stock ?? 0;
    obj.category = obj.category?.toString() || '';
    return obj;
};

=======
const upload = require('../middleware/upload');

const router = express.Router();

>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
<<<<<<< HEAD
        res.json(products.map(normalize));
=======
        res.json(products);
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
<<<<<<< HEAD
            res.json(normalize(product));
=======
            res.json(product);
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
<<<<<<< HEAD
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, price, size, category, countInStock, description, imageUrl } = req.body;
=======
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { name, price, size, category, countInStock, description } = req.body;
        let imageUrl = '';

        if (req.file) {
            imageUrl = req.file.path; // Cloudinary returns the full URL in path
        }
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc

        const product = new Product({
            name,
            price,
            description,
            size: typeof size === 'string' ? size.split(',').map(s => s.trim()) : size,
            category,
<<<<<<< HEAD
            countInStock: countInStock || 0,
            imageUrl: imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
=======
            countInStock,
            imageUrl,
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
<<<<<<< HEAD
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, price, size, category, description, countInStock, imageUrl } = req.body;
=======
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
    try {
        const { name, price, size, category, description, countInStock } = req.body;
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
<<<<<<< HEAD
            product.category = category || product.category;
            if (size) product.size = typeof size === 'string' ? size.split(',').map(s => s.trim()) : size;
            if (imageUrl) product.imageUrl = imageUrl;

            const updatedProduct = await product.save();
            res.json(normalize(updatedProduct));
=======
            if (size) product.size = typeof size === 'string' ? size.split(',').map(s => s.trim()) : size;
            product.category = category || product.category;

            if (req.file) {
                product.imageUrl = req.file.path; // Cloudinary returns the full URL in path
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
<<<<<<< HEAD
        if (product) {
            await product.deleteOne();
=======

        if (product) {
            await product.deleteOne(); // updated method in mongoose 7+
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 32f1e39a541ce39a126d9cb2c8356ce4d057b6dc
