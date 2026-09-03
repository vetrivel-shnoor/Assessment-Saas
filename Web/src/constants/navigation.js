import { 
  LayoutDashboard, 
  Users, 
  FileSignature, 
  Settings, 
  UserCircle, 
  Shield, 
  UserCog,
  Package,
  User
} from "lucide-react";
import { TAB_PERMISSIONS } from "./permissions";

// --- DASHBOARD NAVIGATION ---
export const DASHBOARD_TABS = [
  { name: 'Dashboard', path: '', icon: LayoutDashboard, requiredPermission: TAB_PERMISSIONS.dashboard },
  { name: 'Profile', path: '/profile', icon: UserCircle, requiredPermission: TAB_PERMISSIONS.profile, requireWorkspace: ['personal'] },
  { name: 'Assessments', path: '/assessments', icon: FileSignature, requiredPermission: TAB_PERMISSIONS.assessments, requireWorkspace: ['tenant'] },
  { name: 'Candidates', path: '/candidates', icon: Users, requiredPermission: TAB_PERMISSIONS.candidates, requireWorkspace: ['tenant'] },
  { name: 'Users', path: '/users', icon: UserCog, requiredPermission: TAB_PERMISSIONS.users, requireWorkspace: ['platform-admin'] },
  { name: 'Roles', path: '/roles', icon: Shield, requiredPermission: TAB_PERMISSIONS.roles, requireWorkspace: ['platform-admin'] },
  { name: 'Settings', path: '/settings', icon: Settings, requiredPermission: TAB_PERMISSIONS.settings, requireWorkspace: ['tenant', 'platform-admin'] },
];

// --- PROFILE TABS ---
export const PROFILE_TABS = [
  {
    id: "personal",
    label: "Personal Info",
    icon: User,
    visibility: {
      requireWorkspace: ['personal', 'platform-admin', 'tenant'], // Can show everywhere
    }
  }
];

// --- SETTINGS TABS ---
export const SETTINGS_TABS = [
  {
    id: "organisation",
    label: "Organisation Details",
    icon: Package,
    visibility: {
      requireWorkspace: ['tenant'], // MUST be in a tenant workspace
    }
  },
  {
    id: "platform_admin",
    label: "Platform Admin Settings",
    icon: Package, 
    visibility: {
      requireWorkspace: ['platform-admin'],
      requireRole: ['superadmin']
    }
  },
];
