"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const products_controller_1 = require("../controllers/products.controller");
const router = (0, express_1.Router)();
router.get('/', products_controller_1.getProducts);
router.get('/:id', products_controller_1.getProduct);
// images are optional; upload middleware allows zero files
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'vendor'), upload_1.uploadImage.array('images', 5), products_controller_1.createProduct);
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'vendor'), products_controller_1.updateProduct);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'vendor'), products_controller_1.deleteProduct);
exports.default = router;
