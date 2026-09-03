import { useState, useEffect, useRef } from 'react';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const TenantSwitcher = () => {
  const { user, setUser } = useApp();
  const [tenants, setTenants] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchTenants = async () => {
      setIsFetching(true);
      try {
        const res = await api.get('/api/tenants/my-tenants');
        setTenants(res.data.tenants || []);
      } catch (err) {
        console.error('Failed to fetch tenants', err);
        // Fallback: build a single-item list from user's current tenantId
        if (user?.tenantId) {
          setTenants([{ id: user.tenantId, name: user.companyName || 'My Organisation' }]);
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchTenants();

    // Listen for updates from Settings page
    const handleTenantUpdated = () => {
      fetchTenants();
    };
    window.addEventListener("tenant-updated", handleTenantUpdated);
    
    return () => window.removeEventListener("tenant-updated", handleTenantUpdated);
  }, [user?.role, user?.tenantId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentWorkspaceContext = localStorage.getItem('workspaceContext') || 'personal';

  const currentTenant = user?.tenantId ? tenants.find(t => t.id === user?.tenantId) : null;

  const handleSwitch = async (tenantId, contextType) => {
    if (tenantId === user?.tenantId && contextType === currentWorkspaceContext) {
      setIsOpen(false);
      return;
    }
    
    try {
      setIsLoading(true);
      await api.post('/api/tenants/switch', { tenantId });
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
      
      localStorage.setItem('workspaceContext', contextType);
      if (tenantId) {
        localStorage.setItem('activeTenantId', tenantId);
      } else {
        localStorage.removeItem('activeTenantId');
      }
      
      toast.success(`Switched to ${contextType === 'platform-admin' ? 'Platform Admin' : contextType === 'personal' ? 'Personal Workspace' : 'Organisation'}`);
      setIsOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to switch workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const label = isFetching 
    ? 'Loading...' 
    : user?.tenantId 
      ? (currentTenant?.name || 'Select Org') 
      : currentWorkspaceContext === 'platform-admin' 
        ? 'Platform Admin' 
        : 'Personal Workspace';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        disabled={isLoading || isFetching}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm disabled:opacity-60"
      >
        {currentTenant?.logoUrl ? (
          <img 
            src={getImageUrl(currentTenant.logoUrl)} 
            alt="Logo" 
            className="w-5 h-5 rounded object-cover flex-shrink-0"
          />
        ) : (
          <Building2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        )}
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[140px] truncate">
          {label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-60 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
          
          {/* --- Platform Admin Workspace (Superadmin only) --- */}
          {user?.role === 'superadmin' && (
            <div className="py-1 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => handleSwitch(null, 'platform-admin')}
                className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                  !user?.tenantId && currentWorkspaceContext === 'platform-admin'
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${!user?.tenantId && currentWorkspaceContext === 'platform-admin' ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <Building2 className="w-4 h-4 opacity-50" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${!user?.tenantId && currentWorkspaceContext === 'platform-admin' ? '' : ''}`}>Platform Admin</p>
                  </div>
                </div>
                {!user?.tenantId && currentWorkspaceContext === 'platform-admin' && <Check className="w-4 h-4 flex-shrink-0" />}
              </button>
            </div>
          )}

          {/* --- Personal Workspace --- */}
          <div className="py-1 border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => handleSwitch(null, 'personal')}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                !user?.tenantId && currentWorkspaceContext === 'personal'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${!user?.tenantId && currentWorkspaceContext === 'personal' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <Building2 className="w-4 h-4 opacity-50" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${!user?.tenantId && currentWorkspaceContext === 'personal' ? '' : ''}`}>Personal Workspace</p>
                </div>
              </div>
              {!user?.tenantId && currentWorkspaceContext === 'personal' && <Check className="w-4 h-4 flex-shrink-0" />}
            </button>
          </div>

          <div className="px-4 py-2.5 text-[0.65rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
            Your Organisations
          </div>

          <div className="py-1 max-h-56 overflow-y-auto">
            {tenants.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                No organisations found
              </div>
            ) : (
              tenants.map(tenant => {
                const isActive = tenant.id === user?.tenantId;
                return (
                  <button
                    key={tenant.id}
                    onClick={() => handleSwitch(tenant.id, 'tenant')}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {tenant.logoUrl ? (
                        <img 
                          src={getImageUrl(tenant.logoUrl)} 
                          alt="Logo" 
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <Building2 className="w-4 h-4 opacity-50" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? '' : ''}`}>{tenant.name}</p>
                        {tenant.plan?.name && (
                          <p className="text-[0.65rem] text-gray-400 dark:text-gray-500 truncate">{tenant.plan.name} plan</p>
                        )}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/onboarding?action=create-org&step=1';
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Organisation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSwitcher;
