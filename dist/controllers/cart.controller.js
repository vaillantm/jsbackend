"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateQuantity = exports.addToCart = exports.getMyCart = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
async function ensureCart(userId) {
    // ✅ Make sure userId exists
    if (!userId)
        throw new Error("User ID is missing. Make sure auth middleware runs before cart routes.");
    // ✅ Check if the cart already exists
    let cart = await Cart_1.Cart.findOne({ userId });
    // ✅ If not, create it safely
    if (!cart) {
        try {
            cart = await Cart_1.Cart.create({ userId, items: [] });
        }
        catch (err) {
            // ⚠️ Handle race conditions where two requests create a cart at the same time
            if (err.code === 11000) { // MongoDB duplicate key error
                cart = await Cart_1.Cart.findOne({ userId });
            }
            else {
                throw err;
            }
        }
    }
    return cart;
}
exports.getMyCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cart = await ensureCart(req.user.id);
    res.json(cart);
});
exports.addToCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    const { productId, quantity } = req.body;
    const product = await Product_1.Product.findById(productId);
    if (!product)
        return res.status(404).json({ message: 'Product not found' });
    const cart = await ensureCart(req.user.id);
    if (!cart) {
        return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
    }
    const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
    if (idx >= 0)
        cart.items[idx].quantity += Number(quantity || 1);
    else
        cart.items.push({ productId, quantity: Number(quantity || 1) });
    await cart.save();
    res.json(cart);
});
exports.updateQuantity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await ensureCart(req.user.id);
    if (!cart) {
        return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
    }
    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item)
        return res.status(404).json({ message: 'Item not found' });
    item.quantity = Number(quantity);
    await cart.save();
    res.json(cart);
});
exports.removeFromCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.body;
    const cart = await ensureCart(req.user.id);
    if (!cart) {
        return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
    }
    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
    await cart.save();
    res.json(cart);
});
exports.clearCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cart = await ensureCart(req.user.id);
    if (!cart) {
        return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
    }
    cart.items = [];
    await cart.save();
    res.json(cart);
});
