import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function CustomerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/mine').then(({ data }) => setPayments(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Payments & Invoices</h1>
        <p>View your payment history and download invoices</p>
      </div>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Spent', value: formatCurrency(total), icon: '💳', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
          { label: 'Transactions', value: payments.length, icon: '📄', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Pending', value: payments.filter(p => p.status === 'pending').length, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
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

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Payment History</h3>
        {loading ? <div className="loading-page"><div className="loader" /></div>
          : payments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <h3>No payments yet</h3>
              <p>Your payment history will appear here</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th><th>Service</th><th>Provider</th>
                    <th>Amount</th><th>Method</th><th>Date</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.invoiceNumber}</td>
                      <td>{p.request?.title || '—'}</td>
                      <td>{p.provider?.name || '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{formatCurrency(p.amount)}</td>
                      <td><span className="badge badge-muted">{p.method?.toUpperCase()}</span></td>
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
