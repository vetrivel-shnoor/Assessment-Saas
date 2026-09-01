import prisma from '../config/prisma.js';
import hotcache from '../utils/hotcache.js';

export const createRole = async (req, res) => {
  try {
    const { name, description, permissionIds } = req.body;
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissionIds.map(id => ({ permissionId: id }))
        }
      },
      include: { permissions: { include: { permission: true } } }
    });
    await hotcache.invalidateRoles();
    res.status(201).json({ success: true, role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId }
    });
    await hotcache.invalidateUserPermissions(userId);
    res.json({ success: true, message: 'Role assigned' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignCustomPermission = async (req, res) => {
  try {
    const { userId, permissionId } = req.body;
    await prisma.userPermission.upsert({
      where: { userId_permissionId: { userId, permissionId } },
      update: { isRevoked: false },
      create: { userId, permissionId }
    });
    await hotcache.invalidateUserPermissions(userId);
    res.json({ success: true, message: 'Custom permission assigned' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserEffectivePermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await hotcache.getUserPermissions(userId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const roles = await hotcache.getRoles();
    res.json({ success: true, roles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissionIds } = req.body;

    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) return res.status(404).json({ message: 'Role not found' });
    if (existingRole.name === 'superadmin') {
      return res.status(403).json({ message: 'Cannot modify the superadmin role' });
    }

    // Update role details and recreate permissions
    await prisma.rolePermission.deleteMany({ where: { roleId: id } });
    
    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: {
          create: permissionIds.map(permId => ({ permissionId: permId }))
        }
      },
      include: { permissions: { include: { permission: true } } }
    });
    
    // invalidate all users with this role
    const usersWithRole = await prisma.userRole.findMany({ where: { roleId: id } });
    for (const ur of usersWithRole) {
      await hotcache.invalidateUserPermissions(ur.userId);
    }
    await hotcache.invalidateRoles();

    res.json({ success: true, role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) return res.status(404).json({ message: 'Role not found' });
    if (existingRole.name === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete the superadmin role' });
    }

    const usersWithRole = await prisma.userRole.findMany({ where: { roleId: id } });
    
    await prisma.role.delete({ where: { id } });
    
    for (const ur of usersWithRole) {
      await hotcache.invalidateUserPermissions(ur.userId);
    }
    await hotcache.invalidateRoles();

    res.json({ success: true, message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.json({ success: true, permissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
