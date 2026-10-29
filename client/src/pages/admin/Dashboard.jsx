import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reqsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/requests?limit=5')
        ]);
        setStats(statsRes.data);
        setRecentRequests(reqsRes.data.requests || []);
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="page-loader"><div className="loader" /></div>;
  }

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: '💰', color: '#10b981' },
    { label: 'Total Requests', value: stats?.totalRequests || 0, icon: '📋', color: '#6366f1' },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: '👥', color: '#3b82f6' },
    { label: 'Providers', value: stats?.totalProviders || 0, icon: '🔧', color: '#f59e0b' },
    { label: 'Pending Requests', value: stats?.pendingRequests || 0, icon: '⏳', color: '#ef4444' },
    { label: 'Completed Requests', value: stats?.completedRequests || 0, icon: '✅', color: '#10b981' },
    { label: 'Open Complaints', value: stats?.openComplaints || 0, icon: '⚠️', color: '#f97316' },
    { label: 'Verified Pros', value: stats?.verifiedProviders || 0, icon: '🛡️', color: '#8b5cf6' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Admin Control Center ⚡</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Platform overview, real-time activity, user management, and service operations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/services" className="btn btn-primary btn-sm">Manage Services</Link>
          <Link to="/admin/users" className="btn btn-outline btn-sm">Manage Users</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        {statCards.map((stat, idx) => (
          <div key={idx} className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: `${stat.color}18`,
              border: `1px solid ${stat.color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Nav & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Recent Requests Table */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Recent Service Requests</h3>
            <Link to="/admin/requests" style={{ fontSize: 14, color: 'var(--color-primary)' }}>View All →</Link>
          </div>

          {recentRequests.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No requests found yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '8px 12px' }}>Customer</th>
                    <th style={{ padding: '8px 12px' }}>Service</th>
                    <th style={{ padding: '8px 12px' }}>Status</th>
                    <th style={{ padding: '8px 12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map(r => (
                    <tr key={r._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 12px', fontWeight: 600 }}>{r.customer?.name || 'Customer'}</td>
                      <td style={{ padding: '12px 12px' }}>{r.service?.name || r.category || 'Service'}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span className={`badge ${getStatusBadgeClass(r.status)}`}>
                          {getStatusLabel(r.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px', color: 'var(--text-secondary)', fontSize: 12 }}>
                        {formatDate(r.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links / Navigation Cards */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Operations & Governance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/admin/users" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
              textDecoration: 'none', color: 'inherit', border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>User Management</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Verify providers, deactivate abusive accounts</div>
              </div>
              <span>→</span>
            </Link>

            <Link to="/admin/services" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
              textDecoration: 'none', color: 'inherit', border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>Service Catalog</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Add new services, configure pricing & categories</div>
              </div>
              <span>→</span>
            </Link>

            <Link to="/admin/complaints" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
              textDecoration: 'none', color: 'inherit', border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>Complaints & Support</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Review reported issues and mediate disputes</div>
              </div>
              <span>→</span>
            </Link>

            <Link to="/admin/payments" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
              textDecoration: 'none', color: 'inherit', border: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>Transactions & Invoices</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Audit platform revenues and payment logs</div>
              </div>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
