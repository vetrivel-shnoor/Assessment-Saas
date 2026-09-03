import argon2 from "argon2";
import prisma from "../config/prisma.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import hotcache from "../utils/hotcache.js";

// ==============================================
// 1. SIGNUP
// ==============================================
export const Signup = async (req, res) => {
  try {
    const { 
      fullname, email, password, confirmPassword, phone, 
      userType, companyName, jobTitle, skills, experienceLevel 
    } = req.body;

    const finalFullname = fullname || "User";

    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 chars long and include uppercase, lowercase, number, and symbol.",
      });
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await argon2.hash(password);
    const envSuperadmins = process.env.SUPERADMIN_EMAILS ? process.env.SUPERADMIN_EMAILS.split(',').map(e => e.trim()) : [];
    const isSuperadmin = envSuperadmins.includes(email);
    
    // Assign role based on frontend userType toggle ('candidate' vs 'organisation')
    let role = userType === 'organisation' ? 'organisation' : 'candidate';
    if (isSuperadmin) role = 'superadmin';

    const newUser = await prisma.users.create({
      data: {
        firstName: finalFullname.split(' ')[0] || "User",
        lastName: finalFullname.split(' ').slice(1).join(' ') || "",
        email,
        password: hashedPassword,
        phone,
        role,
        onboardingCompleted: role === 'candidate', // true for candidates, false for organisations
        companyName: role === 'organisation' ? companyName : null,
        jobTitle: role === 'organisation' ? jobTitle : null,
        skills: role === 'candidate' ? skills : null,
        experienceLevel: role === 'candidate' ? experienceLevel : null
      }
    });

    // Assign default PBAC user role or superadmin
    const roleToAssign = isSuperadmin ? 'superadmin' : 'user';
    const pbacRole = await prisma.role.findUnique({ where: { name: roleToAssign } });
    if (pbacRole) {
      await prisma.userRole.create({
        data: { userId: newUser.id, roleId: pbacRole.id }
      });
    }

    generateTokenAndSetCookie(res, newUser.id);

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        onboardingCompleted: newUser.onboardingCompleted
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 2. LOGIN
// ==============================================
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user || !user.password) {
        // user.password could be null if signed up via Google
        return res.status(404).json({ message: "User not found or uses social login" });
    }

    const match = await argon2.verify(user.password, password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    generateTokenAndSetCookie(res, user.id);

    const fullUser = await hotcache.getUserProfile(user.id);
    const { permissions } = await hotcache.getUserPermissions(user.id);

    res.status(200).json({
      message: "Login successful",
      user: {
        ...fullUser,
        permissions
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================================
// 3. LOGOUT
// ==============================================
export const Logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// ==============================================
// 4. ME (Check Auth Status)
// ==============================================
export const Me = async (req, res) => {
  let user = await hotcache.getUserProfile(req.user.id);

  const envSuperadmins = process.env.SUPERADMIN_EMAILS ? process.env.SUPERADMIN_EMAILS.split(',').map(e => e.trim()) : [];
  if (process.env.DEFAULT_SUPERADMIN_EMAIL && !envSuperadmins.includes(process.env.DEFAULT_SUPERADMIN_EMAIL)) {
    envSuperadmins.push(process.env.DEFAULT_SUPERADMIN_EMAIL);
  }

  if (user && envSuperadmins.includes(user.email) && user.role !== 'superadmin') {
     await prisma.users.update({ where: { id: user.id }, data: { role: 'superadmin' } });
     const superAdminRole = await prisma.role.findUnique({ where: { name: 'superadmin' } });
     if (superAdminRole) {
       await prisma.userRole.upsert({
         where: { userId_roleId: { userId: user.id, roleId: superAdminRole.id } },
         update: {},
         create: { userId: user.id, roleId: superAdminRole.id }
       });
     }
     user.role = 'superadmin';
     await hotcache.invalidateUserProfile(user.id);
     await hotcache.invalidateUserPermissions(user.id);
  } else if (user && user.role === 'superadmin' && !envSuperadmins.includes(user.email)) {
     await prisma.users.update({ where: { id: user.id }, data: { role: 'user' } });
     const superAdminRole = await prisma.role.findUnique({ where: { name: 'superadmin' } });
     const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
     if (superAdminRole) {
       await prisma.userRole.deleteMany({
         where: { userId: user.id, roleId: superAdminRole.id }
       });
     }
     if (userRole) {
       await prisma.userRole.upsert({
         where: { userId_roleId: { userId: user.id, roleId: userRole.id } },
         update: {},
         create: { userId: user.id, roleId: userRole.id }
       });
     }
     user.role = 'user';
     await hotcache.invalidateUserProfile(user.id);
     await hotcache.invalidateUserPermissions(user.id);
  }

  const { permissions } = await hotcache.getUserPermissions(user.id);

  // Override response with header-provided workspace context if available
  if (req.user.workspaceContext) {
    user.workspaceContext = req.user.workspaceContext;
    if (req.user.workspaceContext === 'personal' || req.user.workspaceContext === 'platform-admin') {
      user.tenantId = null;
    } else if (req.user.workspaceContext === 'tenant' && req.user.tenantId) {
      user.tenantId = req.user.tenantId;
    }
  }

  res.status(200).json({
    success: true,
    user: {
      ...user,
      permissions
    }
  });
};

// ==============================================
// 5. reset-password
// ==============================================
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset instructions sent to email",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==============================================
// 6. CONFIG (Check if Google Auth is enabled)
// ==============================================
export const Config = (req, res) => {
    res.status(200).json({
        googleAuthEnabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    });
};

// ==============================================
// 7. COMPLETE ONBOARDING
// ==============================================
export const CompleteOnboarding = async (req, res) => {
  try {
    const { userType, companyName, planId, billing } = req.body;
    const userId = req.user.id;

    if (!userType) {
      return res.status(400).json({ message: "User type is required" });
    }

    const role = userType === 'organisation' ? 'organisation' : 'candidate';

    const updateData = {
      role,
      onboardingCompleted: true,
      companyName: role === 'organisation' ? (companyName || null) : null,
    };

    if (role === 'organisation') {
      if (!planId) {
        return res.status(400).json({ message: "Plan is required for organisations" });
      }
      const tenantName = companyName || "My Organisation";
      const newTenant = await prisma.tenant.create({
        data: {
          name: tenantName,
          planId,
          billingCycle: billing || 'monthly',
          userTenants: {
            create: { userId, role: 'owner' }
          }
        }
      });
      updateData.tenantId = newTenant.id;
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData
    });

    await hotcache.invalidateUserProfile(userId);

    const { permissions } = await hotcache.getUserPermissions(userId);

    res.status(200).json({
      message: "Onboarding completed successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        onboardingCompleted: updatedUser.onboardingCompleted,
        tenantId: updatedUser.tenantId,
        permissions
      }
    });
  } catch (error) {
    console.error("Complete Onboarding Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
