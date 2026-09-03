import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

// Import Components
import ProfileSidebar from "../components/profile/ProfileSidebar";
import OrgInfoTab from "../components/profile/tabs/OrgInfoTab";
import PlatformAdminSettingsTab from "../components/profile/tabs/PlatformAdminSettingsTab";

// Import Constants
import { SETTINGS_TABS } from "../constants/navigation";

// Map IDs to Component Objects
const TAB_COMPONENTS = {
  organisation: OrgInfoTab,
  platform_admin: PlatformAdminSettingsTab,
};

export default function SettingsPage() {
  const { theme: themeString } = useTheme();
  const theme = themeString === 'dark' ? {
    bg: '#0F172A',
    text: '#ffffff',
    navbar: { border: '#1e293b', textIdle: '#9ca3af' }
  } : {
    bg: '#F4F7F6',
    text: '#111827',
    navbar: { border: '#e5e7eb', textIdle: '#6b7280' }
  };
  const { user, setUser } = useApp();

  // Determine initial active tab based on available tabs for the user
  const currentWorkspaceContext = localStorage.getItem('workspaceContext') || 'personal';
  const availableTabs = SETTINGS_TABS.filter(tab => {
    const v = tab.visibility || {};
    if (v.requireWorkspace && Array.isArray(v.requireWorkspace)) {
      if (!v.requireWorkspace.includes(currentWorkspaceContext)) return false;
      if (currentWorkspaceContext === 'tenant' && !user?.tenantId) return false;
    }
    if (v.requireRole && Array.isArray(v.requireRole)) {
      if (!v.requireRole.includes(user?.role)) return false;
    }
    return true;
  });

  const [activeTabId, setActiveTabId] = useState(availableTabs.length > 0 ? availableTabs[0].id : null);

  // Determine which component to render
  const ActiveComponent = activeTabId ? TAB_COMPONENTS[activeTabId] : null;

  if (!user) return null;

  return (
    <div className="w-full mx-auto px-4 sm:px-8 py-4 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: theme.text }}>Workspace Settings</h1>
        <p className="text-sm opacity-60 mt-2">Manage configurations for your current workspace context.</p>
      </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <div className="w-full max-w-4xl">
          {ActiveComponent ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTabId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveComponent theme={theme} user={user} setUser={setUser} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="bg-white/5 p-6 rounded-2xl border flex flex-col items-center justify-center py-20" style={{ borderColor: theme.navbar?.border }}>
              <p className="text-sm opacity-60">No settings available for this workspace.</p>
            </div>
          )}
        </div>
    </div>
  );
}
