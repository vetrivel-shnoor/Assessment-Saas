import React from "react";

export default function PlatformAdminSettingsTab({ theme, user }) {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase" style={{ color: theme.text }}>
          Platform Admin Settings
        </h2>
        <p className="text-sm opacity-60">Manage global platform configurations and superadmin settings.</p>
      </div>

      <div className="bg-white/5 p-6 rounded-2xl border" style={{ borderColor: theme.navbar?.border }}>
        <p className="text-sm" style={{ color: theme.text }}>
          Welcome, {user.firstName}. You are currently operating in the global Platform Admin Workspace.
        </p>
      </div>
    </div>
  );
}
