import prisma from '../config/prisma.js';
import hotcache from '../utils/hotcache.js';
import { enqueueMedia } from "../services/mediaService.js";

// ============================================================
// PLANS
// ============================================================

// GET /api/tenant/plans — public, used by onboarding
export const getPlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        planModules: {
          include: { module: true },
        },
      },
      orderBy: { price: 'asc' },
    });

    const formatted = plans.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      yearlyPrice: p.yearlyPrice,
      maxUsers: p.maxUsers,
      maxAssessments: p.maxAssessments,
      maxCandidates: p.maxCandidates,
      isActive: p.isActive,
      features: p.planModules.map(pm => ({
        name: pm.module.name,
        description: pm.module.description,
      })),
    }));

    res.status(200).json({ plans: formatted });
  } catch (error) {
    console.error('Get Plans Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/tenant/plans — superadmin only
export const createPlan = async (req, res) => {
  try {
    const { name, price, yearlyPrice, maxUsers, maxAssessments, maxCandidates } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const plan = await prisma.plan.create({
      data: { name, price, yearlyPrice, maxUsers, maxAssessments, maxCandidates },
    });
    res.status(201).json({ message: 'Plan created', plan });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A plan with this name already exists' });
    }
    console.error('Create Plan Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/tenant/plans/:id — superadmin only
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, yearlyPrice, maxUsers, maxAssessments, maxCandidates, isActive } = req.body;
    const plan = await prisma.plan.update({
      where: { id },
      data: { name, price, yearlyPrice, maxUsers, maxAssessments, maxCandidates, isActive },
    });
    res.status(200).json({ message: 'Plan updated', plan });
  } catch (error) {
    console.error('Update Plan Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/tenant/plans/:id — superadmin only
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantCount = await prisma.tenant.count({ where: { planId: id } });
    if (tenantCount > 0) {
      return res.status(400).json({ message: `Cannot delete: ${tenantCount} tenant(s) are on this plan` });
    }
    await prisma.plan.delete({ where: { id } });
    res.status(200).json({ message: 'Plan deleted' });
  } catch (error) {
    console.error('Delete Plan Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ============================================================
// TENANTS
// ============================================================

export const getMyTenants = async (req, res) => {
  try {
    const userTenants = await prisma.userTenant.findMany({
      where: { userId: req.user.id },
      include: { tenant: { include: { plan: true } } },
    });
    const tenants = userTenants.map(ut => ({
      ...ut.tenant,
      memberRole: ut.role,
    }));
    res.status(200).json({ tenants, currentTenantId: req.user.tenantId });
  } catch (error) {
    console.error('Get My Tenants Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const switchTenant = async (req, res) => {
  try {
    const { tenantId } = req.body;
    
    if (!tenantId) {
      await prisma.users.update({
        where: { id: req.user.id },
        data: { tenantId: null },
      });
      await hotcache.invalidateUserProfile(req.user.id);
      return res.status(200).json({ message: 'Switched to personal workspace', tenantId: null });
    }

    const userTenant = await prisma.userTenant.findUnique({
      where: { userId_tenantId: { userId: req.user.id, tenantId } },
    });
    if (!userTenant) {
      return res.status(403).json({ message: 'Not a member of this tenant' });
    }
    await prisma.users.update({
      where: { id: req.user.id },
      data: { tenantId },
    });
    await hotcache.invalidateUserProfile(req.user.id);
    res.status(200).json({ message: 'Switched tenant successfully', tenantId });
  } catch (error) {
    console.error('Switch Tenant Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyTenant = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(404).json({ message: 'No tenant associated with user' });
    }
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
      include: {
        plan: {
          include: {
            planModules: { include: { module: true } },
          },
        },
      },
    });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    const accessibleModules = tenant.plan.planModules.map(pm => pm.module.name);
    res.status(200).json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: {
          name: tenant.plan.name,
          limits: {
            maxUsers: tenant.plan.maxUsers,
            maxAssessments: tenant.plan.maxAssessments,
            maxCandidates: tenant.plan.maxCandidates,
          },
        },
        accessibleModules,
      },
    });
  } catch (error) {
    console.error('Get Tenant Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTenantPlan = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { planId } = req.body;
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { planId },
    });
    res.status(200).json({ message: 'Tenant plan updated successfully', tenant: updatedTenant });
  } catch (error) {
    console.error('Update Tenant Plan Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const createTenant = async (req, res) => {
  try {
    const { name, planId, billingCycle } = req.body;
    const userId = req.user.id;

    if (!name || !planId) {
      return res.status(400).json({ message: 'Name and planId are required' });
    }

    const newTenant = await prisma.tenant.create({
      data: {
        name,
        planId,
        billingCycle: billingCycle || 'monthly',
        userTenants: {
          create: { userId, role: 'owner' },
        },
      },
    });

    // Optionally switch user to this new tenant right away
    await prisma.users.update({
      where: { id: userId },
      data: { tenantId: newTenant.id, role: 'organisation' },
    });

    await hotcache.invalidateUserProfile(userId);

    res.status(201).json({ message: 'Organisation created successfully', tenant: newTenant });
  } catch (error) {
    console.error('Create Tenant Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ============================================================
// TENANT PROFILE UPDATES
// ============================================================

export const updateMyTenantName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(404).json({ message: "No active organisation" });

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { name },
    });
    res.status(200).json({ message: "Organisation name updated", tenant: updatedTenant });
  } catch (error) {
    console.error("Update Tenant Name Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const uploadTenantLogo = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(404).json({ message: "No active organisation" });
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    await enqueueMedia(req.file, tenantId, "tenant", "logoUrl", req.user.id);

    res.status(200).json({
      success: true,
      message: "Logo upload started. Processing in background...",
    });
  } catch (error) {
    console.error("Logo Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
