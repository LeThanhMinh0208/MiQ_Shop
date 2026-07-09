import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { glbUploadMiddleware } from '../middlewares/upload.middleware.js';
import {
  getCollections,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
  addModel3d,
  removeModel3d,
  uploadModel3d,
  addSlide,
  removeSlide,
  addModelPhoto,
  removeModelPhoto,
} from '../controllers/collection.controller.js';

const router = Router();

// Public
router.get('/',       getCollections);
router.get('/:slug',  getCollectionBySlug);

// Admin — signed GLB upload (before /:id routes so 'upload-model' is not misread as an id)
router.post('/upload-model', protect, isAdmin, glbUploadMiddleware, uploadModel3d);

// Admin — CRUD
router.post('/',      protect, isAdmin, createCollection);
router.put('/:id',    protect, isAdmin, updateCollection);
router.delete('/:id', protect, isAdmin, deleteCollection);

// Admin — 3D models
router.post('/:id/models3d',                protect, isAdmin, addModel3d);
router.delete('/:id/models3d/:modelId',    protect, isAdmin, removeModel3d);

// Admin — slide images
router.post('/:id/slides',             protect, isAdmin, addSlide);
router.delete('/:id/slides/:slideId',  protect, isAdmin, removeSlide);

// Admin — model photos
router.post('/:id/model-photos',              protect, isAdmin, addModelPhoto);
router.delete('/:id/model-photos/:photoId',   protect, isAdmin, removeModelPhoto);

export default router;
