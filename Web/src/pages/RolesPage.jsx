import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Shield, Edit, Trash2, Plus, X, Loader2 } from 'lucide-react';
import api from '../services/api';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', permissionIds: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/api/pbac/role'),
        api.get('/api/pbac/permission')
      ]);
      setRoles(rolesRes.data.roles);
      setPermissions(permsRes.data.permissions);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissionIds: role.permissions.map(rp => rp.permission.id)
      });
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '', permissionIds: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const togglePermission = (id) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id) 
        ? prev.permissionIds.filter(pId => pId !== id)
        : [...prev.permissionIds, id]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingRole) {
        await api.put(`/api/pbac/role/${editingRole.id}`, formData);
      } else {
        await api.post('/api/pbac/role', formData);
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save role', error);
      alert(error.response?.data?.message || 'Error saving role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await api.delete(`/api/pbac/role/${id}`);
        await fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting role');
      }
    }
  };

  // Group permissions by subject for nicer UI
  const groupedPermissions = permissions.reduce((acc, curr) => {
    acc[curr.subject] = acc[curr.subject] || [];
    acc[curr.subject].push(curr);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-500" />
              Role Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage platform roles and their associated permissions.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm">Role Name</th>
                  <th className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm">Description</th>
                  <th className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm">Permissions</th>
                  <th className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {roles.map(role => (
                  <tr key={role.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{role.name}</span>
                      {role.name === 'superadmin' && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          System
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                      {role.description || 'No description'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {role.permissions.length} permissions
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {role.name !== 'superadmin' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(role)}
                            className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(role.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value.toLowerCase()})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                      placeholder="e.g. manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input 
                      type="text" 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                      placeholder="Brief description of the role"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                    <span>Assign Permissions</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                      {formData.permissionIds.length} selected
                    </span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedPermissions).map(([subject, perms]) => (
                      <div key={subject} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 capitalize text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                          {subject}
                        </h4>
                        <div className="space-y-2">
                          {perms.map(p => (
                            <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                              <div className="relative flex items-center">
                                <input 
                                  type="checkbox" 
                                  checked={formData.permissionIds.includes(p.id)}
                                  onChange={() => togglePermission(p.id)}
                                  className="peer sr-only"
                                />
                                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center group-hover:border-emerald-400">
                                  <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" viewBox="0 0 14 10" fill="none">
                                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                {p.action}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/30">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving || !formData.name}
                  className="px-5 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default RolesPage;
