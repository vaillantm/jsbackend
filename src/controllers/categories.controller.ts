import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Category } from '../models/Category';
import { AuthRequest } from '../middleware/auth';

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cat = await Category.create({ name: req.body.name, description: req.body.description, createdBy: req.user!.id });
  res.status(201).json(cat);
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const list = await Category.find();
  res.json(list);
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Not found' });
  res.json(cat);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) return res.status(404).json({ message: 'Not found' });
  res.json(cat);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
