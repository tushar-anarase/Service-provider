import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { getStatusBadgeClass, getStatusLabel, formatDate, formatCurrency } from '../../utils/helpers';

const SERVICES = [
  { icon: '⚡', name: 'Electrical Repair', id: 'Electrical Repair' },
  { icon: '🔧', name: 'Plumbing', id: 'Plumbing' },
  { icon: '❄️', name: 'AC Service & Repair', id: 'AC Service & Repair' },
  { icon: '🪚', name: 'Carpentry', id: 'Carpentry' },
  { icon: '🧹', name: 'Home Cleaning', id: 'Home Cleaning' },
  { icon: '🔩', name: 'Vehicle Mechanic', id: 'Vehicle Mechanic' },
  { icon: '🔌', name: 'Appliance Repair', id: 'Appliance Repair' },
  { icon: '🎨', name: 'Painting', id: 'Painting' },
  { icon: '🪲', name: 'Pest Control', id: 'Pest Control' },
  { icon: '📹', name: 'CCTV Installation', id: 'CCTV Installation' },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/requests?limit=5');
        const requests = data.requests || [];
        setRecentRequests(requests);
        setStats({
          total: data.total || 0,
          pending: requests.filter(r => r.status === 'pending').length,
          completed: requests.filter(r => r.status === 'completed').length,
          cancelled: requests.filter(r => r.status === 'cancelled').length,
        });
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1040 0%, #0d1224 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, background: 'var(--primary)', borderRadius: '50%', opacity: 0.06 }} />
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
          {greeting}, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>What service do you need today?</p>
        <Link to="/customer/requests/new" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
          ➕ Book a New Service
        </Link>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Requests', value: stats.total, icon: '📋', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Completed', value: stats.completed, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Cancelled', value: stats.cancelled, icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-body">
              <div className="stat-value" style={{ color: s.color }}>{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 17 }}>Browse Services</h3>
          <Link to="/customer/requests/new" className="btn btn-sm btn-outline">View All</Link>
        </div>
        <div className="services-grid">
          {SERVICES.map(s => (
            <div
              key={s.id}
              className="service-card"
              onClick={() => navigate(`/customer/requests/new?service=${encodeURIComponent(s.name)}`)}
            >
              <span className="service-card-icon">{s.icon}</span>
              <div className="service-card-name">{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 17 }}>Recent Requests</h3>
          <Link to="/customer/requests" className="btn btn-sm btn-secondary">View All →</Link>
        </div>
        {loading ? (
          <div className="loading-page"><div className="loader" /></div>
        ) : recentRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No requests yet</h3>
            <p>Book your first service to get started</p>
            <Link to="/customer/requests/new" className="btn btn-primary" style={{ marginTop: 16 }}>Book a Service</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentRequests.map(r => (
              <div key={r._id} className="request-card" onClick={() => navigate(`/customer/requests/${r._id}`)}>
                <div className="request-card-header">
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.service?.name || r.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.location?.city}</div>
                  </div>
                  <span className={getStatusBadgeClass(r.status)}>{getStatusLabel(r.status)}</span>
                </div>
                <div className="request-card-meta">
                  <span className="request-meta-item">📅 {formatDate(r.createdAt)}</span>
                  {r.provider && <span className="request-meta-item">👤 {r.provider?.name}</span>}
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
