import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/requirePermission.js';
import {
  createRole,
  assignRoleToUser,
  assignCustomPermission,
  getUserEffectivePermissions,
  getAllRoles,
  updateRole,
  deleteRole,
  getAllPermissions
} from '../controllers/pbacController.js';

const router = express.Router();

router.use(protect());

// Only those who can manage Roles can do these
router.get('/role', requirePermission('read', 'Role'), getAllRoles);
router.post('/role', requirePermission('create', 'Role'), createRole);
router.put('/role/:id', requirePermission('update', 'Role'), updateRole);
router.delete('/role/:id', requirePermission('delete', 'Role'), deleteRole);

router.get('/permission', requirePermission('read', 'Role'), getAllPermissions);

router.post('/assign-role', requirePermission('manage', 'Role'), assignRoleToUser);
router.post('/assign-permission', requirePermission('manage', 'Role'), assignCustomPermission);

// Only those who can read users can read user permissions
router.get('/user/:userId', requirePermission('read', 'User'), getUserEffectivePermissions);

export default router;
