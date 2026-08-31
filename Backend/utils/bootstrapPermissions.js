import prisma from '../config/prisma.js';
import { APP_PERMISSIONS } from '../config/permissions.js';
import argon2 from 'argon2';
import hotcache from './hotcache.js';

export const bootstrapPermissions = async () => {
  console.log('Bootstrapping permissions and superadmins...');
  try {
    for (const perm of APP_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { action_subject: { action: perm.action, subject: perm.subject } },
        update: { description: perm.description },
        create: { action: perm.action, subject: perm.subject, description: perm.description }
      });
    }

    // Ensure superadmin and user roles exist
    const superAdminRole = await prisma.role.upsert({
      where: { name: 'superadmin' },
      update: {},
      create: { name: 'superadmin', description: 'Super Administrator' }
    });

    const userRole = await prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: { name: 'user', description: 'Standard User' }
    });

    // Assign all permissions to superadmin
    const allPerms = await prisma.permission.findMany();
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: perm.id }
      });
    }

    // Default Superadmin creation
    const defaultEmail = process.env.DEFAULT_SUPERADMIN_EMAIL;
    const defaultPassword = process.env.DEFAULT_SUPERADMIN_PASSWORD;

    if (defaultEmail && defaultPassword) {
      const existingDefault = await prisma.users.findUnique({ where: { email: defaultEmail } });
      if (!existingDefault) {
        const hashedPassword = await argon2.hash(defaultPassword);
        const newUser = await prisma.users.create({
          data: {
            email: defaultEmail,
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'superadmin'
          }
        });
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: newUser.id, roleId: superAdminRole.id } },
          update: {},
          create: { userId: newUser.id, roleId: superAdminRole.id }
        });
      }
    }

    // Sync SUPERADMIN_EMAILS
    const envSuperadmins = process.env.SUPERADMIN_EMAILS ? process.env.SUPERADMIN_EMAILS.split(',').map(e => e.trim()) : [];
    if (defaultEmail && !envSuperadmins.includes(defaultEmail)) {
      envSuperadmins.push(defaultEmail);
    }

    // Promote listed users to superadmin
    if (envSuperadmins.length > 0) {
      const usersToPromote = await prisma.users.findMany({ where: { email: { in: envSuperadmins } } });
      for (const user of usersToPromote) {
        if (user.role !== 'superadmin') {
          await prisma.users.update({ where: { id: user.id }, data: { role: 'superadmin' } });
        }
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: superAdminRole.id } },
          update: {},
          create: { userId: user.id, roleId: superAdminRole.id }
        });
        await hotcache.invalidateUserPermissions(user.id);
      }
    }

    // Demote users who are superadmin but not in env
    const currentSuperadmins = await prisma.users.findMany({
      where: {
        OR: [
          { role: 'superadmin' },
          { userRoles: { some: { roleId: superAdminRole.id } } }
        ]
      }
    });

    for (const user of currentSuperadmins) {
      if (!envSuperadmins.includes(user.email)) {
        await prisma.users.update({ where: { id: user.id }, data: { role: 'user' } });
        await prisma.userRole.deleteMany({
          where: { userId: user.id, roleId: superAdminRole.id }
        });
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: userRole.id } },
          update: {},
          create: { userId: user.id, roleId: userRole.id }
        });
        await hotcache.invalidateUserPermissions(user.id);
      }
    }

    console.log('Successfully bootstrapped permissions and synced superadmins.');
  } catch (error) {
    console.error('Failed to bootstrap permissions:', error);
  }
};
