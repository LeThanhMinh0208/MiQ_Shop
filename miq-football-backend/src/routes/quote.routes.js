import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import {
  createQuote,
  getQuotes,
  updateQuoteStatus,
  deleteQuote,
} from '../controllers/quote.controller.js';

const router = Router();

router.post('/', createQuote);
router.get('/', protect, isAdmin, getQuotes);
router.patch('/:id/status', protect, isAdmin, updateQuoteStatus);
router.delete('/:id', protect, isAdmin, deleteQuote);

export default router;
