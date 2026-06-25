import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getSiteAssets, upsertSiteAsset, deleteSiteAsset } from '../controllers/siteAsset.controller.js';

const router = Router();

router.get('/', getSiteAssets);
router.put('/', protect, restrictTo('admin'), upsertSiteAsset);
router.delete('/', protect, restrictTo('admin'), deleteSiteAsset);

export default router;
