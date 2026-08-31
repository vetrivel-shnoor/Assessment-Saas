import hotcache from '../utils/hotcache.js';

/**
 * Middleware factory to check PBAC permissions.
 * Usage: router.post('/route', protect(), requirePermission('create', 'Role'), controllerFn)
 */
export const requirePermission = (action, subject) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Bypass for superadmin (from authMiddleware req.user.role)
      if (req.user.role === 'superadmin') {
        return next();
      }

      const { roles, permissions } = await hotcache.getUserPermissions(req.user.id);

      // Check if any assigned role is superadmin
      if (roles.includes('superadmin')) {
        return next();
      }

      // Check if user has the specific permission (or the 'manage all' override)
      const hasPermission = permissions.some(p => 
        (p.action === action && p.subject === subject) ||
        (p.action === 'manage' && p.subject === 'all')
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Forbidden: Requires '${action}' on '${subject}'` 
        });
      }

      next();
    } catch (error) {
      console.error('requirePermission middleware error:', error);
      res.status(500).json({ message: 'Internal server error checking permissions' });
    }
  };
};
