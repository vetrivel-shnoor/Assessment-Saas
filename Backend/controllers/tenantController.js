import prisma from '../config/prisma.js';

export const getMyTenant = async (req, res) => {
  try {
    if (!req.user.tenantId) {
      return res.status(404).json({ message: "No tenant associated with user" });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
      include: {
        plan: {
          include: {
            planModules: {
              include: {
                module: true
              }
            }
          }
        }
      }
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Format accessible modules
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
            maxCandidates: tenant.plan.maxCandidates
          }
        },
        accessibleModules
      }
    });
  } catch (error) {
    console.error("Get Tenant Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTenantPlan = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { planId } = req.body;

    // Typically this route would be restricted to superadmins via PBAC
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { planId }
    });

    res.status(200).json({ message: "Tenant plan updated successfully", tenant: updatedTenant });
  } catch (error) {
    console.error("Update Tenant Plan Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
