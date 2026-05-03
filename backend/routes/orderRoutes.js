const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            // Make sure user can only cancel their own order
            if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await order.deleteOne();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/:id/shipping', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only edit Pending orders' });
        }
        order.shippingAddress = {
            fullName: req.body.fullName || order.shippingAddress.fullName,
            address: req.body.address || order.shippingAddress.address,
            city: req.body.city || order.shippingAddress.city,
            phoneNumber: req.body.phoneNumber || order.shippingAddress.phoneNumber,
        };
        const updated = await order.save();
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
