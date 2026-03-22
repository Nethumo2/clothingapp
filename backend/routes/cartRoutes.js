const express = require('express');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

const router = express.Router();

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
        const { productId, quantity, size, price } = req.body;

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
        }

        const itemIndex = cart.items.findIndex(p => p.product.toString() === productId && p.size === size);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += Number(quantity);
        } else {
            cart.items.push({ product: productId, quantity: Number(quantity), size });
        }

        // simplistic total price update logic since we pass price directly
        cart.totalPrice += Number(price) * Number(quantity);

        await cart.save();

        // Repopulate before returning
        cart = await Cart.findById(cart._id).populate('items.product');

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
            // Find item to calculate price reduction
            const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);

            if (itemIndex > -1) {
                const item = cart.items[itemIndex];
                const itemPrice = item.product.price;
                cart.totalPrice -= itemPrice * item.quantity;

                if (cart.totalPrice < 0) cart.totalPrice = 0; // prevent negative float errors

                cart.items.splice(itemIndex, 1);
                await cart.save();
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

module.exports = router;
