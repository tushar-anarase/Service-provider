import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { getStatusBadgeClass, getStatusLabel, formatDate, formatCurrency, Stars } from '../../utils/helpers';

export default function ProviderDashboard() {
  const { user, reload } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, earnings: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(user?.providerProfile?.availabilityStatus || 'available');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/requests?limit=5');
        const jobs = data.requests || [];
        setRecentJobs(jobs);
        setStats({
          total: data.total || 0,
          active: jobs.filter(r => ['accepted', 'on_the_way', 'arrived', 'in_progress'].includes(r.status)).length,
          completed: jobs.filter(r => r.status === 'completed').length,
          earnings: user?.providerProfile?.totalEarnings || 0,
        });
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleAvailability = async () => {
    const next = availability === 'available' ? 'offline' : 'available';
    try {
      await api.put('/providers/availability', { availabilityStatus: next });
      setAvailability(next);
      await reload();
      toast.success('Status Updated', `You are now ${next}`);
    } catch { toast.error('Error', 'Could not update status'); }
  };

  const profile = user?.providerProfile;
  const isVerified = profile?.isVerifiedProvider;

  return (
    <div>
      {/* Welcome + Status Toggle */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0d1224 100%)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Welcome, {user?.name?.split(' ')[0]}! 🔧</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isVerified ? '✅ Verified Provider' : '⚠️ Pending Verification'}
            {profile?.rating > 0 && <span style={{ marginLeft: 12 }}>⭐ {profile.rating?.toFixed(1)} ({profile.totalReviews} reviews)</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: availability === 'available' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
            border: `1px solid ${availability === 'available' ? 'var(--success)' : 'var(--border)'}`,
            borderRadius: 30, padding: '8px 18px',
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: availability === 'available' ? 'var(--success)' : 'var(--text-muted)',
              animation: availability === 'available' ? 'pulse 1.5s infinite' : 'none',
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: availability === 'available' ? 'var(--success)' : 'var(--text-muted)' }}>
              {availability === 'available' ? 'Available' : 'Offline'}
            </span>
          </div>
          <button className={`btn btn-sm ${availability === 'available' ? 'btn-secondary' : 'btn-success'}`} onClick={toggleAvailability}>
            {availability === 'available' ? 'Go Offline' : 'Go Online'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/provider/jobs/available')}>
            🔍 Find Jobs
          </button>
        </div>
      </div>

      {!profile?.profileCompleted && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fbbf24' }}>⚠️ Complete Your Profile</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Add your skills, experience and service areas to start receiving jobs</div>
          </div>
          <button className="btn btn-warning btn-sm" style={{ background: '#f59e0b', color: '#000', fontWeight: 700 }} onClick={() => navigate('/provider/profile')}>
            Complete Now →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Jobs', value: stats.total, icon: '📋', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Active Jobs', value: stats.active, icon: '🔨', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Completed', value: profile?.completedJobs || 0, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total Earnings', value: formatCurrency(profile?.totalEarnings || 0), icon: '💰', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-body">
              <div className="stat-value" style={{ color: s.color, fontSize: typeof s.value === 'string' ? 20 : 28 }}>{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 17 }}>Recent Jobs</h3>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/provider/jobs')}>View All →</button>
        </div>
        {loading ? <div className="loading-page"><div className="loader" /></div>
          : recentJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No jobs yet</h3>
              <p>Browse available jobs nearby and accept one to get started</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/provider/jobs/available')}>Find Jobs</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentJobs.map(r => (
                <div key={r._id} className="request-card" onClick={() => navigate(`/provider/jobs/${r._id}`)}>
                  <div className="request-card-header">
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.service?.name || r.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>👤 {r.customer?.name} • 📍 {r.location?.city}</div>
                    </div>
                    <span className={getStatusBadgeClass(r.status)}>{getStatusLabel(r.status)}</span>
                  </div>
                  <div className="request-card-meta">
                    <span className="request-meta-item">📅 {formatDate(r.createdAt)}</span>
                    {r.quotation?.amount > 0 && <span className="request-meta-item">💰 {formatCurrency(r.quotation.amount)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
