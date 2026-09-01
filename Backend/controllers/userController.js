import prisma from '../config/prisma.js';
import hotcache from '../utils/hotcache.js';
import argon2 from 'argon2';

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          phone: true,
          companyName: true,
          jobTitle: true,
          onboardingCompleted: true,
          createdAt: true,
          googleId: true,
          profilePicture: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.users.count()
    ]);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.users.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (role === 'superadmin') {
      return res.status(403).json({ message: 'Superadmin role can only be assigned via environment variables' });
    }
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Superadmin roles cannot be modified via the interface' });
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: { role }
    });

    const pbacRole = await prisma.role.findUnique({ where: { name: role } });
    if (pbacRole) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.create({
        data: { userId: id, roleId: pbacRole.id }
      });
    }

    await hotcache.invalidateUserProfile(id);
    await hotcache.invalidateUserPermissions(id);

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.users.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'superadmin') {
       return res.status(403).json({ message: 'Cannot delete superadmin accounts' });
    }

    await prisma.users.delete({ where: { id } });
    await hotcache.invalidateUserProfile(id);
    await hotcache.invalidateUserPermissions(id);

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const user = await prisma.users.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Superadmin passwords cannot be changed via the interface' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await argon2.hash(password);

    await prisma.users.update({
      where: { id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, companyName, jobTitle } = req.body;

    const user = await prisma.users.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Superadmin accounts cannot be modified via the interface' });
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        companyName,
        jobTitle
      }
    });

    await hotcache.invalidateUserProfile(id);

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
