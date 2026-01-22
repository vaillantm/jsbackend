import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

async function ensureCart(userId: string) {
  // ✅ Make sure userId exists
  if (!userId) throw new Error("User ID is missing. Make sure auth middleware runs before cart routes.");

  // ✅ Check if the cart already exists
  let cart = await Cart.findOne({ userId });

  // ✅ If not, create it safely
  if (!cart) {
    try {
      cart = await Cart.create({ userId, items: [] });
    } catch (err: any) {
      // ⚠️ Handle race conditions where two requests create a cart at the same time
      if (err.code === 11000) { // MongoDB duplicate key error
        cart = await Cart.findOne({ userId });
      } else {
        throw err;
      }
    }
  }

  return cart;
}

export const getMyCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await ensureCart(req.user!.id);
  res.json(cart);
});

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const cart = await ensureCart(req.user!.id);

  if (!cart) {
    return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
  }

  const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
  if (idx >= 0) cart.items[idx].quantity += Number(quantity || 1);
  else cart.items.push({ productId, quantity: Number(quantity || 1) } as any);
  await cart.save();
  res.json(cart);
});

export const updateQuantity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;
  const cart = await ensureCart(req.user!.id);
  if (!cart) {
    return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
  }
  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  item.quantity = Number(quantity);
  await cart.save();
  res.json(cart);
});

export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  const cart = await ensureCart(req.user!.id);
  if (!cart) {
    return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
  }
  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  await cart.save();
  res.json(cart);
});

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await ensureCart(req.user!.id);
  if (!cart) {
    return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
  }
  cart.items = [];
  await cart.save();
  res.json(cart);
});
