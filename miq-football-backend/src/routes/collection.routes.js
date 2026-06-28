import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import {
  getCollections,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
  addSlide,
  removeSlide,
  addModelPhoto,
  removeModelPhoto,
} from '../controllers/collection.controller.js';

const router = Router();

// Public
router.get('/',       getCollections);
router.get('/:slug',  getCollectionBySlug);

// Admin — CRUD
router.post('/',      protect, isAdmin, createCollection);
router.put('/:id',    protect, isAdmin, updateCollection);
router.delete('/:id', protect, isAdmin, deleteCollection);

// Admin — slide images
router.post('/:id/slides',             protect, isAdmin, addSlide);
router.delete('/:id/slides/:slideId',  protect, isAdmin, removeSlide);

// Admin — model photos
router.post('/:id/model-photos',              protect, isAdmin, addModelPhoto);
router.delete('/:id/model-photos/:photoId',   protect, isAdmin, removeModelPhoto);

export default router;
