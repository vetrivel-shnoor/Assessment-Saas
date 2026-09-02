import prisma from '../config/prisma.js';

/**
 * Middleware to check if the user's tenant plan includes a specific module.
 * @param {string} moduleName - The name of the module (e.g. 'Assessments', 'Interviews')
 */
export const requireModuleAccess = (moduleName) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // Set by protect() middleware
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Superadmins bypass module checks
      if (user.role === 'superadmin') {
        return next();
      }

      if (!user.tenantId) {
        return res.status(403).json({ message: "User does not belong to a tenant" });
      }

      // Fetch the tenant and their plan modules
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
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

      if (!tenant || !tenant.plan) {
        return res.status(403).json({ message: "Tenant or Plan not found" });
      }

      // Check if the plan includes the requested module
      const hasAccess = tenant.plan.planModules.some(pm => pm.module.name === moduleName);

      if (!hasAccess) {
        return res.status(403).json({ 
          message: `Your current plan (${tenant.plan.name}) does not include access to the '${moduleName}' module. Please upgrade your plan.` 
        });
      }

      // Attach tenant info to request for convenience in downstream controllers
      req.tenant = tenant;
      
      next();
    } catch (error) {
      console.error('[Module Access Error]', error);
      res.status(500).json({ message: "Internal server error during module access check" });
    }
  };
};

/**
 * Validates quantitative limits for a specific entity based on the tenant's plan.
 * Used internally inside controllers or as middleware where appropriate.
 */
export const checkPlanLimit = async (tenantId, limitField, currentCount) => {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { plan: true }
    });

    if (!tenant || !tenant.plan) throw new Error("Tenant or Plan not found");

    const limit = tenant.plan[limitField];
    if (limit === -1) return true; // Unlimited

    if (currentCount >= limit) {
        throw new Error(`Plan limit reached for ${limitField}. Maximum allowed: ${limit}.`);
    }

    return true;
};
