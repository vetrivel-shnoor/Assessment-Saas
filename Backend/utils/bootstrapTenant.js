import prisma from '../config/prisma.js';
import { APP_MODULES } from '../config/modules.js';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    maxUsers: 3,
    maxAssessments: 5,
    maxCandidates: 20,
  },
  {
    name: 'Pro',
    price: 49,
    yearlyPrice: 39,
    maxUsers: 25,
    maxAssessments: 200,
    maxCandidates: 1000,
  },
  {
    name: 'Enterprise',
    price: 199,
    yearlyPrice: 159,
    maxUsers: 9999,
    maxAssessments: 9999,
    maxCandidates: 9999,
  },
];

export const bootstrapTenantAndPlans = async () => {
  try {
    console.log('[Bootstrap] Checking plans and tenants...');

    // 1. Upsert all plans
    const plansMap = {};
    for (const planData of PLANS) {
      const plan = await prisma.plan.upsert({
        where: { name: planData.name },
        update: {
          price: planData.price,
          yearlyPrice: planData.yearlyPrice,
          maxUsers: planData.maxUsers,
          maxAssessments: planData.maxAssessments,
          maxCandidates: planData.maxCandidates,
        },
        create: planData,
      });
      plansMap[plan.name] = plan;
      console.log(`[Bootstrap] Upserted plan: ${plan.name}`);
    }

    const freePlan = plansMap['Free'];

    // 2. Upsert all Modules and link to plans
    for (const modConfig of APP_MODULES) {
      const mod = await prisma.module.upsert({
        where: { name: modConfig.name },
        update: { description: modConfig.description },
        create: { name: modConfig.name, description: modConfig.description },
      });

      for (const planName of modConfig.plans) {
        const targetPlan = plansMap[planName];
        if (targetPlan) {
          await prisma.planModule.upsert({
            where: { planId_moduleId: { planId: targetPlan.id, moduleId: mod.id } },
            update: {},
            create: { planId: targetPlan.id, moduleId: mod.id },
          });
        }
      }
    }

    // 3. Ensure a "Default Tenant" exists
    let defaultTenant = await prisma.tenant.findFirst({ where: { name: 'Default Tenant' } });
    if (!defaultTenant) {
      defaultTenant = await prisma.tenant.create({
        data: { name: 'Default Tenant', planId: freePlan.id },
      });
      console.log('[Bootstrap] Created "Default Tenant".');
    }

    // 4. Migrate users who have no tenant to default tenant
    const usersWithoutTenant = await prisma.users.findMany({
      where: { tenantId: null, role: { not: 'superadmin' } },
    });
    if (usersWithoutTenant.length > 0) {
      console.log(`[Bootstrap] Migrating ${usersWithoutTenant.length} users to "Default Tenant"...`);
      await prisma.users.updateMany({
        where: { tenantId: null, role: { not: 'superadmin' } },
        data: { tenantId: defaultTenant.id },
      });
    }

    console.log('[Bootstrap] Tenant and Plan bootstrapping completed.');
  } catch (error) {
    console.error('[Bootstrap] Failed to bootstrap tenants and plans:', error);
  }
};
