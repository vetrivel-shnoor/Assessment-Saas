import React, { useState, useEffect } from 'react';

import { UserCog, Edit, Trash2, Shield, Loader2, X } from 'lucide-react';
import api from '../services/api';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editDetails, setEditDetails] = useState({
    firstName: '', lastName: '', phone: '', companyName: '', jobTitle: ''
  });
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = React.useRef();

  const lastUserElementRef = React.useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    api.get('/api/pbac/role').then(res => setRoles(res.data.roles)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (pageNumber) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/api/users?page=${pageNumber}&limit=10`);
      
      setUsers(prev => {
        if (pageNumber === 1) return res.data.users;
        // Avoid duplicates in React 18 strict mode
        const existingIds = new Set(prev.map(u => u.id));
        const newUsers = res.data.users.filter(u => !existingIds.has(u.id));
        return [...prev, ...newUsers];
      });
      setHasMore(pageNumber < res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleOpenModal = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setNewPassword('');
    setEditDetails({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      companyName: user.companyName || '',
      jobTitle: user.jobTitle || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setSelectedRole('');
    setNewPassword('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSaving(true);
      const updates = [];
      
      // Update details
      updates.push(api.put(`/api/users/${editingUser.id}`, editDetails));

      if (selectedRole && selectedRole !== editingUser.role) {
        updates.push(api.put(`/api/users/${editingUser.id}/role`, { role: selectedRole }));
      }
      if (newPassword) {
        updates.push(api.put(`/api/users/${editingUser.id}/password`, { password: newPassword }));
      }
      
      if (updates.length > 0) {
        await Promise.all(updates);
      }
      
      if (page === 1) {
        await fetchUsers(1);
      } else {
        setPage(1); // This will trigger useEffect to fetch page 1
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to update user', error);
      alert(error.response?.data?.message || 'Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/api/users/${id}`);
        if (page === 1) {
          await fetchUsers(1);
        } else {
          setPage(1);
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  return (
    <>
      <div className="p-4 sm:p-8 w-full mx-auto space-y-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <UserCog size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">User Management</h1>
              <p className="text-sm opacity-60">Manage system users and their platform roles.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin opacity-50" size={32} />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id} ref={index === users.length - 1 ? lastUserElementRef : null}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.companyName && (
                              <div className="text-[10px] uppercase opacity-50 tracking-wider">
                                {user.companyName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono opacity-80 flex items-center gap-2">
                        {user.email}
                        {user.googleId && (
                          <span title="Google Account" className="text-emerald-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${user.role === 'superadmin'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300'
                          }`}>
                          <Shield size={10} />
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="opacity-70 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            disabled={user.role === 'superadmin'}
                            className={`p-2 rounded-lg transition-colors ${user.role === 'superadmin'
                                ? 'opacity-30 cursor-not-allowed text-gray-500'
                                : 'text-gray-500 hover:text-emerald-500 hover:bg-emerald-500/10'
                              }`}
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={user.role === 'superadmin'}
                            className={`p-2 rounded-lg transition-colors ${user.role === 'superadmin'
                                ? 'opacity-30 cursor-not-allowed text-gray-500'
                                : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
                              }`}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan="5" className="text-center opacity-50">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
        )}

        {/* Edit Role Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <div>
                  <h3 className="font-black text-lg">Edit User</h3>
                  <p className="text-xs opacity-60">For {editingUser?.email}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col h-full max-h-[85vh]">
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50 ml-1">First Name</label>
                      <input type="text" required value={editDetails.firstName} onChange={(e) => setEditDetails(p => ({...p, firstName: e.target.value}))} className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50 ml-1">Last Name</label>
                      <input type="text" required value={editDetails.lastName} onChange={(e) => setEditDetails(p => ({...p, lastName: e.target.value}))} className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50 ml-1">Company Name</label>
                      <input type="text" value={editDetails.companyName} onChange={(e) => setEditDetails(p => ({...p, companyName: e.target.value}))} className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase opacity-50 ml-1">Job Title</label>
                      <input type="text" value={editDetails.jobTitle} onChange={(e) => setEditDetails(p => ({...p, jobTitle: e.target.value}))} className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50 ml-1">Phone Number</label>
                    <input type="tel" value={editDetails.phone} onChange={(e) => setEditDetails(p => ({...p, phone: e.target.value}))} className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-white/10 my-6"></div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase opacity-50 ml-1">Platform Role</label>
                    <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  >
                    <option value="" disabled className="dark:bg-[#111]">Select a role...</option>
                    {roles.filter(r => r.name !== 'superadmin').map(r => (
                      <option key={r.id} value={r.name} className="dark:bg-[#111]">
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase opacity-50 ml-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                </div>

                <div className="p-6 pt-4 border-t border-gray-200 dark:border-white/10 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 rounded-xl font-bold uppercase text-xs hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl font-bold uppercase text-xs bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default UsersPage;
