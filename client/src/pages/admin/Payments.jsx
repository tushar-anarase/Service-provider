import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/payments');
        setPayments(data || []);
      } catch {
        toast.error('Error', 'Failed to load payments history');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const totalVolume = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const platformFee = payments.reduce((acc, p) => acc + (p.platformFee || p.amount * 0.1 || 0), 0);
  const providerPayouts = totalVolume - platformFee;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Platform Financials & Payments</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time transaction log, platform commission breakdown, and payout auditing.</p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Processed Volume</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {formatCurrency(totalVolume)}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Platform Commission (10%)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
            {formatCurrency(platformFee)}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Provider Disbursed Earnings</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1', marginTop: 4 }}>
            {formatCurrency(providerPayouts)}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Transactions Settled</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {payments.length}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" /></div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No payment transactions recorded yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Invoice #</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Provider</th>
                  <th style={{ padding: '12px 16px' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Method</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      INV-{p._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{p.customer?.name || 'Customer'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.customer?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{p.provider?.name || 'Provider'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.provider?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(p.amount)}
                    </td>
                    <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>
                      {p.method || 'Online'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-success">
                        {p.status || 'PAID'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 12 }}>
                      {formatDate(p.createdAt)}
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
