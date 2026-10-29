import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users || []);
    } catch {
      toast.error('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}/toggle-active`);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success('Updated', `User account ${currentStatus ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Error', 'Failed to update user status');
    }
  };

  const verifyProvider = async (id) => {
    try {
      await api.put(`/admin/providers/${id}/verify`);
      setUsers(users.map(u => u._id === id ? {
        ...u,
        isVerified: true,
        providerProfile: { ...u.providerProfile, isVerifiedProvider: true }
      } : u));
      toast.success('Verified', 'Provider has been verified');
    } catch {
      toast.error('Error', 'Failed to verify provider');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>User Management</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>View, verify, and moderate all platform users.</p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            className="input"
            style={{ width: 140 }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="customer">Customers</option>
            <option value="provider">Providers</option>
            <option value="admin">Admins</option>
          </select>
          <input
            type="text"
            className="input"
            placeholder="Search name, email, phone..."
            style={{ width: 220 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" /></div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>User</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Verification</th>
                  <th style={{ padding: '12px 16px' }}>Joined</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.email} • {u.phone || 'No phone'}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : u.role === 'provider' ? 'badge-warning' : 'badge-info'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.role === 'provider' ? (
                        u.providerProfile?.isVerifiedProvider ? (
                          <span className="badge badge-success">✓ Verified Pro</span>
                        ) : (
                          <button
                            onClick={() => verifyProvider(u._id)}
                            className="btn btn-outline btn-xs"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                          >
                            Verify Pro
                          </button>
                        )
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 12 }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => toggleActive(u._id, u.isActive)}
                        className={`btn ${u.isActive ? 'btn-danger' : 'btn-primary'} btn-xs`}
                        style={{ fontSize: 12, padding: '4px 10px' }}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
