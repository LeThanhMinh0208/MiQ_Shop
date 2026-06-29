import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import {
  createTradeIn,
  getTradeIns,
  updateTradeIn,
  deleteTradeIn,
} from '../controllers/tradeIn.controller.js';

const router = Router();

router.post('/',     createTradeIn);
router.get('/',      protect, isAdmin, getTradeIns);
router.patch('/:id', protect, isAdmin, updateTradeIn);
router.delete('/:id', protect, isAdmin, deleteTradeIn);

export default router;
