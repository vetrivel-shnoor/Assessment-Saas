import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { getAllUsers, updateUserRole, deleteUser, updateUserPassword, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.use(protect());

router.get('/', requirePermission('read', 'User'), getAllUsers);
router.put('/:id', requirePermission('manage', 'User'), updateUser);
router.put('/:id/role', requirePermission('manage', 'User'), updateUserRole);
router.put('/:id/password', requirePermission('manage', 'User'), updateUserPassword);
router.delete('/:id', requirePermission('manage', 'User'), deleteUser);

export default router;
