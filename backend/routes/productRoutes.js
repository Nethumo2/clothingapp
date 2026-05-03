const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

const normalize = (product) => {
    const obj = product.toObject ? product.toObject() : product;
    obj.size = obj.size || obj.sizes || [];
    obj.imageUrl = obj.imageUrl || obj.images?.[0]?.url || obj.images?.[0] || '';
    obj.countInStock = obj.countInStock ?? obj.stock ?? 0;
    obj.category = obj.category?.toString() || '';
    return obj;
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products.map(normalize));
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
            res.json(normalize(product));
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
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, price, size, category, countInStock, description, imageUrl } = req.body;

        const product = new Product({
            name,
            price,
            description,
            size: typeof size === 'string' ? size.split(',').map((s) => s.trim()) : size,
            category,
            countInStock: countInStock || 0,
            imageUrl: imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
        });

        const createdProduct = await product.save();
        res.status(201).json(normalize(createdProduct));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, price, size, category, description, countInStock, imageUrl } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
            product.category = category || product.category;
            if (size) product.size = typeof size === 'string' ? size.split(',').map((s) => s.trim()) : size;
            if (imageUrl !== undefined) product.imageUrl = imageUrl;

            const updatedProduct = await product.save();
            res.json(normalize(updatedProduct));
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
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
