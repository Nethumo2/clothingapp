const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

const populateCart = (cartId) => Cart.findById(cartId).populate('items.product');

const recalculateTotal = (items) => {
    return items.reduce((total, item) => {
        const price = Number(item.product?.price || 0);
        return total + price * Number(item.quantity || 0);
    }, 0);
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', protect, async (req, res) => {
    try {
        const { productId, quantity, size } = req.body;
        const cartQuantity = Number(quantity);

        if (!Number.isInteger(cartQuantity) || cartQuantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
        }

        const itemSize = size || '';
        const itemIndex = cart.items.findIndex(
            (p) => p.product.toString() === productId && (p.size || '') === itemSize
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += cartQuantity;
        } else {
            cart.items.push({ product: productId, quantity: cartQuantity, size: itemSize });
        }

        await cart.save();

        cart = await populateCart(cart._id);
        cart.totalPrice = recalculateTotal(cart.items);
        await cart.save();
        cart = await populateCart(cart._id);

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
router.put('/update/:itemId', protect, async (req, res) => {
    try {
        const quantity = Number(req.body.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.id(req.params.itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        item.quantity = quantity;
        cart.totalPrice = recalculateTotal(cart.items);

        await cart.save();

        cart = await populateCart(cart._id);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
router.delete('/remove/:itemId', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (cart) {
            const itemIndex = cart.items.findIndex((item) => item._id.toString() === req.params.itemId);

            if (itemIndex > -1) {
                cart.items.splice(itemIndex, 1);
                cart.totalPrice = recalculateTotal(cart.items);
                await cart.save();

                cart = await populateCart(cart._id);
                res.json(cart);
            } else {
                res.status(404).json({ message: 'Item not found in cart' });
            }
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
router.delete('/clear', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();
            cart = await populateCart(cart._id);
            return res.json(cart);
        }
        res.json({ user: req.user._id, items: [], totalPrice: 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
