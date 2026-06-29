import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import {
  createPrintOrder,
  getMyPrintOrders,
  getAllPrintOrders,
  getPrintOrderById,
  updatePrintOrderStatus,
  deletePrintOrder,
} from '../controllers/printOrder.controller.js';

const router = Router();

router.post('/', createPrintOrder);                                   // public — no auth
router.get('/my', protect, getMyPrintOrders);                         // legacy user route
router.get('/', protect, isAdmin, getAllPrintOrders);
router.get('/:id', protect, isAdmin, getPrintOrderById);
router.patch('/:id/status', protect, isAdmin, updatePrintOrderStatus);
router.delete('/:id', protect, isAdmin, deletePrintOrder);

export default router;
