import prisma from '../config/prisma.js';
import { APP_MODULES } from '../config/modules.js';

export const bootstrapTenantAndPlans = async () => {
  try {
    console.log('[Bootstrap] Checking plans and tenants...');

    // 1. Ensure "Free Plan" exists
    let freePlan = await prisma.plan.findUnique({ where: { name: 'Free Plan' } });
    if (!freePlan) {
      freePlan = await prisma.plan.create({
        data: {
          name: 'Free Plan',
          price: 0,
          maxUsers: 5,
          maxAssessments: 2,
          maxCandidates: 10,
        },
      });
      console.log('[Bootstrap] Created "Free Plan".');
    }

    // 2. Ensure "Pro Plan" and "Enterprise Plan" exist as placeholders
    let proPlan = await prisma.plan.findUnique({ where: { name: 'Pro Plan' } });
    if (!proPlan) {
      proPlan = await prisma.plan.create({
        data: { name: 'Pro Plan', price: 99, maxUsers: 50, maxAssessments: -1, maxCandidates: 1000 },
      });
    }

    // Plan lookup map for easy referencing
    const plansMap = {
      'Free Plan': freePlan,
      'Pro Plan': proPlan
    };

    // 3. Ensure Default Modules exist using config
    for (const modConfig of APP_MODULES) {
      let mod = await prisma.module.findUnique({ where: { name: modConfig.name } });
      if (!mod) {
        mod = await prisma.module.create({ 
          data: { 
            name: modConfig.name,
            description: modConfig.description
          } 
        });
      }
      
      // Link modules to plans based on the config
      for (const planName of modConfig.plans) {
        const targetPlan = plansMap[planName];
        if (targetPlan) {
          const link = await prisma.planModule.findUnique({
            where: { planId_moduleId: { planId: targetPlan.id, moduleId: mod.id } }
          });
          if (!link) {
            await prisma.planModule.create({
              data: { planId: targetPlan.id, moduleId: mod.id }
            });
          }
        }
      }
    }

    // 4. Ensure a "Default Tenant" exists
    let defaultTenant = await prisma.tenant.findFirst({ where: { name: 'Default Tenant' } });
    if (!defaultTenant) {
      defaultTenant = await prisma.tenant.create({
        data: {
          name: 'Default Tenant',
          planId: freePlan.id,
        }
      });
      console.log('[Bootstrap] Created "Default Tenant".');
    }

    // 5. Migrate existing non-superadmin users who don't have a tenant
    const usersWithoutTenant = await prisma.users.findMany({
      where: {
        tenantId: null,
        role: { not: 'superadmin' }
      }
    });

    if (usersWithoutTenant.length > 0) {
      console.log(`[Bootstrap] Migrating ${usersWithoutTenant.length} users to "Default Tenant"...`);
      await prisma.users.updateMany({
        where: {
          tenantId: null,
          role: { not: 'superadmin' }
        },
        data: {
          tenantId: defaultTenant.id
        }
      });
      console.log('[Bootstrap] User migration complete.');
    }

    console.log('[Bootstrap] Tenant and Plan bootstrapping completed.');
  } catch (error) {
    console.error('[Bootstrap] Failed to bootstrap tenants and plans:', error);
  }
};
