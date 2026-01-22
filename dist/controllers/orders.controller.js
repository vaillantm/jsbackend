"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateStatus = exports.adminListOrders = exports.cancelOrder = exports.getOrder = exports.getMyOrders = exports.createOrder = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const emailTemplates_1 = require("../utils/emailTemplates");
exports.createOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cart = await Cart_1.Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0)
        return res.status(400).json({ message: 'Cart is empty' });
    const products = await Product_1.Product.find({ _id: { $in: cart.items.map((i) => i.productId) } });
    const items = cart.items.map((i) => {
        const p = products.find((x) => x._id.equals(i.productId));
        return { productId: p._id, name: p.name, price: p.price, quantity: i.quantity };
    });
    const totalAmount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
    const order = await Order_1.Order.create({ userId: req.user.id, items, totalAmount, status: 'pending' });
    cart.items = [];
    await cart.save();
    // Email notification (non-blocking)
    (async () => {
        try {
            const user = await User_1.User.findById(req.user.id);
            if (user)
                await (0, emailTemplates_1.sendOrderPlacedEmail)(user, order._id.toString(), totalAmount);
        }
        catch (_) { }
    })();
    res.status(201).json(order);
});
exports.getMyOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const orders = await Order_1.Order.find({ userId: req.user.id });
    res.json(orders);
});
exports.getOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await Order_1.Order.findById(req.params.id);
    if (!order || order.userId.toString() !== req.user.id)
        return res.status(404).json({ message: 'Not found' });
    res.json(order);
});
exports.cancelOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await Order_1.Order.findById(req.params.id);
    if (!order || order.userId.toString() !== req.user.id)
        return res.status(404).json({ message: 'Not found' });
    if (order.status !== 'pending')
        return res.status(400).json({ message: 'Cannot cancel' });
    order.status = 'cancelled';
    await order.save();
    res.json(order);
});
exports.adminListOrders = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const orders = await Order_1.Order.find();
    res.json(orders);
});
exports.adminUpdateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    const order = await Order_1.Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order)
        return res.status(404).json({ message: 'Not found' });
    // Email notification (non-blocking)
    (async () => {
        try {
            const user = await User_1.User.findById(order.userId);
            if (user)
                await (0, emailTemplates_1.sendOrderStatusUpdateEmail)(user, order._id.toString(), order.status);
        }
        catch (_) { }
    })();
    res.json(order);
});
