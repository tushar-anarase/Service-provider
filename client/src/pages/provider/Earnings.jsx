import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ProviderEarnings() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/mine').then(({ data }) => setPayments(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalEarned = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.providerAmount || 0), 0);
  const totalJobs = user?.providerProfile?.completedJobs || 0;
  const platformFees = payments.reduce((s, p) => s + (p.platformFee || 0), 0);
  const avgPerJob = totalJobs > 0 ? totalEarned / totalJobs : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Earnings & Payouts</h1>
        <p>Track your income and payment history</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Earned', value: formatCurrency(totalEarned), icon: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Completed Jobs', value: totalJobs, icon: '✅', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Avg Per Job', value: formatCurrency(avgPerJob), icon: '📊', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Platform Fees', value: formatCurrency(platformFees), icon: '🏦', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-body">
              <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
        ℹ️ ServicePro charges a <strong>10% platform fee</strong> on each completed job. The remaining 90% is your earnings.
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Payment History</h3>
        {loading ? <div className="loading-page"><div className="loader" /></div>
          : payments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <h3>No earnings yet</h3>
              <p>Complete jobs to start earning</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Platform Fee</th><th>Your Earnings</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.invoiceNumber}</td>
                      <td>{p.customer?.name || '—'}</td>
                      <td>{formatCurrency(p.amount)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(p.platformFee)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(p.providerAmount)}</td>
                      <td>{formatDate(p.createdAt)}</td>
                      <td><span className={`badge ${p.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></td>
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
