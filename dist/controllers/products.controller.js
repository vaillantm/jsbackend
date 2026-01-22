"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.getProducts = exports.createProduct = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Product_1 = require("../models/Product");
const files_1 = require("../utils/files");
exports.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const images = [];
    if (req.files && Array.isArray(req.files)) {
        for (const f of req.files)
            images.push(`/uploads/${f.filename}`);
    }
    const prod = await Product_1.Product.create({
        name: body.name,
        description: body.description,
        price: body.price,
        quantity: body.quantity,
        images,
        categoryId: body.categoryId,
        vendorId: req.user.id,
    });
    res.status(201).json(prod);
});
exports.getProducts = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const list = await Product_1.Product.find();
    res.json(list);
});
exports.getProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const prod = await Product_1.Product.findById(req.params.id);
    if (!prod)
        return res.status(404).json({ message: 'Not found' });
    res.json(prod);
});
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const prod = await Product_1.Product.findById(req.params.id);
    if (!prod)
        return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && prod.vendorId.toString() !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
    const updates = { ...req.body };
    let oldImages;
    if (req.files && Array.isArray(req.files)) {
        oldImages = prod.images || [];
        updates.images = req.files.map((f) => `/uploads/${f.filename}`);
    }
    const updated = await Product_1.Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (oldImages && updates.images && Array.isArray(updates.images)) {
        // remove previous images only if replaced
        (0, files_1.removeFiles)(oldImages);
    }
    res.json(updated);
});
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const prod = await Product_1.Product.findById(req.params.id);
    if (!prod)
        return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && prod.vendorId.toString() !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
    const images = prod.images || [];
    await Product_1.Product.findByIdAndDelete(req.params.id);
    (0, files_1.removeFiles)(images);
    res.status(204).send();
});
