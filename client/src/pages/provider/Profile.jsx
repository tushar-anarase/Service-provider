import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Stars } from '../../utils/helpers';

const ALL_SKILLS = ['Electrical Repair', 'Plumbing', 'AC Service & Repair', 'Carpentry', 'Home Cleaning', 'Vehicle Mechanic', 'Appliance Repair', 'Painting', 'Pest Control', 'CCTV Installation'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProviderProfile() {
  const { user, updateUser, reload } = useAuth();
  const toast = useToast();
  const profile = user?.providerProfile || {};

  const [tab, setTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: { city: user?.address?.city || '', state: user?.address?.state || '', pincode: user?.address?.pincode || '' },
  });
  const [proForm, setProForm] = useState({
    skills: profile.skills || [],
    experience: profile.experience || '',
    bio: profile.bio || '',
    serviceAreas: profile.serviceAreas?.join(', ') || '',
    workingDays: profile.workingDays || DAYS.slice(0, 6),
    workingHours: profile.workingHours || { start: '08:00', end: '20:00' },
  });

  const handle = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) setForm(p => ({ ...p, address: { ...p.address, [name.split('.')[1]]: value } }));
    else setForm(p => ({ ...p, [name]: value }));
  };

  const toggleSkill = (s) => {
    setProForm(p => ({
      ...p,
      skills: p.skills.includes(s) ? p.skills.filter(x => x !== s) : [...p.skills, s],
    }));
  };

  const toggleDay = (d) => {
    setProForm(p => ({
      ...p,
      workingDays: p.workingDays.includes(d) ? p.workingDays.filter(x => x !== d) : [...p.workingDays, d],
    }));
  };

  const saveBasic = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.put('/auth/update-profile', form);
      updateUser(data);
      toast.success('Saved!', 'Basic info updated');
    } catch { toast.error('Error', 'Could not save'); }
    setLoading(false);
  };

  const savePro = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.put('/providers/profile', {
        ...proForm,
        serviceAreas: proForm.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
      });
      updateUser(data);
      toast.success('Saved!', 'Professional profile updated');
    } catch { toast.error('Error', 'Could not save'); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 660, margin: '0 auto' }}>
      {/* Profile Card */}
      <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #0a1628 0%, #0d1224 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div className="avatar avatar-xl" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>{user?.name?.[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{user?.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</div>
            {profile.rating > 0 && <Stars rating={profile.rating} size={16} />}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className={`badge ${profile.isVerifiedProvider ? 'badge-success' : 'badge-warning'}`}>
                {profile.isVerifiedProvider ? '✅ Verified' : '⏳ Pending Verification'}
              </span>
              <span className={`badge ${profile.availabilityStatus === 'available' ? 'badge-success' : 'badge-muted'}`}>
                {profile.availabilityStatus?.toUpperCase()}
              </span>
              {profile.completedJobs > 0 && <span className="badge badge-primary">{profile.completedJobs} Jobs Done</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {[['basic', '👤 Basic Info'], ['professional', '🔧 Professional'], ['password', '🔒 Password']].map(([v, l]) => (
          <div key={v} className={`tab ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</div>
        ))}
      </div>

      {tab === 'basic' && (
        <div className="card">
          <form onSubmit={saveBasic}>
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
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>Save Basic Info</button>
          </form>
        </div>
      )}

      {tab === 'professional' && (
        <div className="card">
          <form onSubmit={savePro}>
            <div className="form-group">
              <label className="form-label">Select Your Skills</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ALL_SKILLS.map(s => (
                  <div key={s} onClick={() => toggleSkill(s)} style={{
                    padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: proForm.skills.includes(s) ? 'rgba(99,102,241,0.15)' : 'var(--bg-elevated)',
                    border: `1px solid ${proForm.skills.includes(s) ? 'var(--primary)' : 'var(--border)'}`,
                    color: proForm.skills.includes(s) ? 'var(--primary-light)' : 'var(--text-secondary)',
                    transition: 'var(--transition)',
                  }}>{s}</div>
                ))}
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input className="form-control" type="number" value={proForm.experience} onChange={e => setProForm(p => ({ ...p, experience: e.target.value }))} min={0} max={50} />
              </div>
              <div className="form-group">
                <label className="form-label">Service Areas (comma-separated)</label>
                <input className="form-control" value={proForm.serviceAreas} onChange={e => setProForm(p => ({ ...p, serviceAreas: e.target.value }))} placeholder="Mumbai, Thane, Navi Mumbai" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio / About You</label>
              <textarea className="form-control" rows={3} value={proForm.bio} onChange={e => setProForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell customers about your experience and expertise..." />
            </div>
            <div className="form-group">
              <label className="form-label">Working Days</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DAYS.map(d => (
                  <div key={d} onClick={() => toggleDay(d)} style={{
                    padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: proForm.workingDays.includes(d) ? 'rgba(16,185,129,0.15)' : 'var(--bg-elevated)',
                    border: `1px solid ${proForm.workingDays.includes(d) ? 'var(--success)' : 'var(--border)'}`,
                    color: proForm.workingDays.includes(d) ? '#34d399' : 'var(--text-secondary)',
                    transition: 'var(--transition)',
                  }}>{d.slice(0, 3)}</div>
                ))}
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Work Start Time</label>
                <input className="form-control" type="time" value={proForm.workingHours.start}
                  onChange={e => setProForm(p => ({ ...p, workingHours: { ...p.workingHours, start: e.target.value } }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Work End Time</label>
                <input className="form-control" type="time" value={proForm.workingHours.end}
                  onChange={e => setProForm(p => ({ ...p, workingHours: { ...p.workingHours, end: e.target.value } }))} />
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Professional Info'}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <PasswordTab />
      )}
    </div>
  );
}

function PasswordTab() {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast.error('Mismatch', 'Passwords do not match'); return; }
    try {
      await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Done', 'Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error('Error', err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="card">
      <form onSubmit={submit}>
        <div className="form-group"><label className="form-label">Current Password</label>
          <input className="form-control" type="password" value={form.currentPassword} onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))} required /></div>
        <div className="form-group"><label className="form-label">New Password</label>
          <input className="form-control" type="password" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} required /></div>
        <div className="form-group"><label className="form-label">Confirm Password</label>
          <input className="form-control" type="password" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} required /></div>
        <button className="btn btn-primary btn-full" type="submit">Change Password</button>
      </form>
    </div>
  );
}
