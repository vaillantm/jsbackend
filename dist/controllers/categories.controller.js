"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.getCategories = exports.createCategory = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Category_1 = require("../models/Category");
exports.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cat = await Category_1.Category.create({ name: req.body.name, description: req.body.description, createdBy: req.user.id });
    res.status(201).json(cat);
});
exports.getCategories = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const list = await Category_1.Category.find();
    res.json(list);
});
exports.getCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cat = await Category_1.Category.findById(req.params.id);
    if (!cat)
        return res.status(404).json({ message: 'Not found' });
    res.json(cat);
});
exports.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cat = await Category_1.Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat)
        return res.status(404).json({ message: 'Not found' });
    res.json(cat);
});
exports.deleteCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await Category_1.Category.findByIdAndDelete(req.params.id);
    res.status(204).send();
});
