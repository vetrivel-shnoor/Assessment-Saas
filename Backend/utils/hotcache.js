import redis from '../config/redis.js';
import prisma from '../config/prisma.js';

const PERMISSIONS_PREFIX = 'user_permissions:';
const CONFIG_PREFIX = 'sys_config:';

/**
 * Fetch a user's permissions, cache them if not cached.
 */
export const getUserPermissions = async (userId) => {
  try {
    const cached = await redis.get(`${PERMISSIONS_PREFIX}${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from DB
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    const directPerms = await prisma.userPermission.findMany({
      where: { userId, isRevoked: false },
      include: { permission: true }
    });

    const permissions = new Set();
    const roles = [];

    // Extract role permissions
    for (const ur of userRoles) {
      roles.push(ur.role.name);
      for (const rp of ur.role.permissions) {
        permissions.add(JSON.stringify({
          action: rp.permission.action,
          subject: rp.permission.subject
        }));
      }
    }

    // Extract direct permissions
    for (const dp of directPerms) {
      permissions.add(JSON.stringify({
        action: dp.permission.action,
        subject: dp.permission.subject
      }));
    }

    const result = {
      roles,
      permissions: Array.from(permissions).map(p => JSON.parse(p))
    };

    // Cache for 1 hour
    await redis.setex(`${PERMISSIONS_PREFIX}${userId}`, 3600, JSON.stringify(result));
    
    return result;
  } catch (error) {
    console.error('HotCache getUserPermissions error:', error);
    return { roles: [], permissions: [] }; // Fallback
  }
};

export const invalidateUserPermissions = async (userId) => {
  try {
    await redis.del(`${PERMISSIONS_PREFIX}${userId}`);
  } catch (error) {
    console.error('HotCache invalidateUserPermissions error:', error);
  }
};

export const getSystemConfig = async (key) => {
  try {
    const cached = await redis.get(`${CONFIG_PREFIX}${key}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('HotCache getSystemConfig error:', error);
    return null;
  }
};

export const setSystemConfig = async (key, value, expiry = 86400) => {
  try {
    await redis.setex(`${CONFIG_PREFIX}${key}`, expiry, JSON.stringify(value));
  } catch (error) {
    console.error('HotCache setSystemConfig error:', error);
  }
};

export default {
  getUserPermissions,
  invalidateUserPermissions,
  getSystemConfig,
  setSystemConfig
};
