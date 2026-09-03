export const APP_PERMISSIONS = [
  { action: 'manage', subject: 'all', description: 'Full access to everything' },
  { action: 'create', subject: 'Role', description: 'Can create new roles' },
  { action: 'read', subject: 'Role', description: 'Can read roles' },
  { action: 'update', subject: 'Role', description: 'Can update roles' },
  { action: 'delete', subject: 'Role', description: 'Can delete roles' },
  { action: 'manage', subject: 'User', description: 'Can manage users' },
  { action: 'read', subject: 'User', description: 'Can read users' },
  { action: 'create', subject: 'Plan', description: 'Can create subscription plans' },
  { action: 'read', subject: 'Plan', description: 'Can read subscription plans' },
  { action: 'update', subject: 'Plan', description: 'Can update subscription plans' },
  { action: 'delete', subject: 'Plan', description: 'Can delete subscription plans' },
];
