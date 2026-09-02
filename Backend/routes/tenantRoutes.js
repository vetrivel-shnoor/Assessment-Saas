import express from 'express';
import { getMyTenant, updateTenantPlan } from '../controllers/tenantController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/requirePermission.js';

const router = express.Router();

// Get the current user's tenant, plan, and modules
router.get('/me', protect(), getMyTenant);

// Update a tenant's plan (Superadmin only)
router.put('/:tenantId/plan', protect(), requirePermission('manage', 'all'), updateTenantPlan);

export default router;
