import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Free',
      price: 0.0,
      maxUsers: 5,
      maxAssessments: 10,
      maxCandidates: 50,
    },
    {
      name: 'Pro',
      price: 49.99,
      maxUsers: 20,
      maxAssessments: 100,
      maxCandidates: 500,
    },
    {
      name: 'Enterprise',
      price: 199.99,
      maxUsers: 9999,
      maxAssessments: 9999,
      maxCandidates: 9999,
    },
  ];

  console.log('Start seeding plans...');
  for (const planData of plans) {
    const plan = await prisma.plan.upsert({
      where: { name: planData.name },
      update: planData,
      create: planData,
    });
    console.log(`Upserted plan: ${plan.name}`);
  }
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
