import { Router } from 'express';
import { getOrCreateRoom, getAllRooms, getMessages } from '../controllers/chat.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';

const router = Router();
router.use(protect);

router.get('/room',                    getOrCreateRoom);
router.get('/rooms',     isAdmin,      getAllRooms);
router.get('/room/:roomId/messages',   getMessages);

export default router;
