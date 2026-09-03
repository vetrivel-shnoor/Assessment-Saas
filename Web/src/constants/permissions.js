export const TAB_PERMISSIONS = {
  dashboard: null,
  profile: null,
  assessments: { action: 'read', subject: 'Assessment' },
  candidates: { action: 'read', subject: 'Candidate' },
  roles: { action: 'manage', subject: 'Role' },
  users: { action: 'manage', subject: 'User' },
  settings: { action: 'manage', subject: 'Settings' }
};

/**
 * Utility to check if a user has a required permission.
 * @param {Array} userPermissions - The permissions array from the user object
 * @param {Object} requiredPermission - { action, subject }
 * @returns {boolean}
 */
export const hasPermission = (user, requiredPermission) => {
  if (!requiredPermission) return true;
  if (!user) return false;

  // Organisation owners and superadmins have full access within their scope
  if (user.role === 'superadmin' || user.role === 'organisation') return true;

  const userPermissions = user.permissions;
  if (!userPermissions || !Array.isArray(userPermissions)) return false;

  return userPermissions.some(p => 
    (p.action === 'manage' && p.subject === 'all') ||
    (p.action === requiredPermission.action && p.subject === requiredPermission.subject)
  );
};
