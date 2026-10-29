import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function CustomerProfile() {
  const { user, updateUser, reload } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: { city: user?.address?.city || '', state: user?.address?.state || '', pincode: user?.address?.pincode || '', street: user?.address?.street || '' },
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('profile');

  const handle = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const f = name.split('.')[1];
      setForm(p => ({ ...p, address: { ...p.address, [f]: value } }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/update-profile', form);
      updateUser(data);
      toast.success('Profile Updated', 'Your changes have been saved');
    } catch { toast.error('Error', 'Could not update profile'); }
    setLoading(false);
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Mismatch', 'Passwords do not match'); return; }
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password Changed', 'Your password has been updated');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error('Error', err.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      {/* Avatar Banner */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 20, background: 'linear-gradient(135deg, #1a1040 0%, #0d1224 100%)' }}>
        <div className="avatar avatar-xl" style={{ margin: '0 auto 12px' }}>{user?.name?.[0]}</div>
        <div style={{ fontWeight: 800, fontSize: 20 }}>{user?.name}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</div>
        <span className="badge badge-primary" style={{ marginTop: 8 }}>Customer</span>
      </div>

      <div className="tabs">
        {['profile', 'password'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'profile' ? '👤 Profile' : '🔒 Password'}
          </div>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card">
          <form onSubmit={saveProfile}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handle} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input className="form-control" name="address.street" value={form.address.street} onChange={handle} placeholder="House no, Street, Area" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" name="address.city" value={form.address.city} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-control" name="address.state" value={form.address.state} onChange={handle} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">PIN Code</label>
              <input className="form-control" name="address.pincode" value={form.address.pincode} onChange={handle} maxLength={6} />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <form onSubmit={changePw}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-control" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-control" type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-control" type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
            </div>
            <button className="btn btn-primary btn-full" type="submit">Change Password</button>
          </form>
        </div>
      )}
    </div>
  );
}
