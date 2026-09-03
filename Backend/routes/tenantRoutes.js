import express from 'express';
import {
  getPlans, createPlan, updatePlan, deletePlan,
  getMyTenant, updateTenantPlan,
  getMyTenants, switchTenant,
} from '../controllers/tenantController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/requirePermission.js';

const router = express.Router();

// ── Plans ───────────────────────────────────────────────────
router.get('/plans', getPlans);                                                              // public
router.post('/plans', protect(), requirePermission('create', 'Plan'), createPlan);           // superadmin
router.put('/plans/:id', protect(), requirePermission('update', 'Plan'), updatePlan);        // superadmin
router.delete('/plans/:id', protect(), requirePermission('delete', 'Plan'), deletePlan);     // superadmin

// ── My Tenant ────────────────────────────────────────────────
router.get('/me', protect(), getMyTenant);
router.put('/:tenantId/plan', protect(), requirePermission('manage', 'all'), updateTenantPlan);

// ── Multi-tenant switching ───────────────────────────────────
router.get('/my-tenants', protect(), getMyTenants);
router.post('/switch', protect(), switchTenant);

export default router;
