import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { getStatusBadgeClass, getStatusLabel, formatDate, formatCurrency } from '../../utils/helpers';

const STATUS_TABS = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = activeTab !== 'all' ? `?status=${activeTab}` : '';
        const { data } = await api.get(`/requests${params}`);
        setRequests(data.requests || []);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [activeTab]);

  const filtered = requests.filter(r =>
    r.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.city?.toLowerCase().includes(search.toLowerCase())
  );

  const urgencyColors = { low: '#10b981', medium: '#f59e0b', high: '#fb923c', emergency: '#ef4444' };

  return (
    <div>
      <div className="page-header">
        <h1>My Service Requests</h1>
        <p>Track all your service requests and their status</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {STATUS_TABS.map(t => (
          <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'all' ? 'All' : getStatusLabel(t)}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/customer/requests/new')}>+ New Request</button>
      </div>

      {loading ? (
        <div className="loading-page"><div className="loader" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No requests found</h3>
          <p>You haven't made any service requests yet</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/customer/requests/new')}>
            Book First Service
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => (
            <div key={r._id} className="request-card" onClick={() => navigate(`/customer/requests/${r._id}`)}>
              <div className="request-card-header">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
                  }}>
                    {['⚡','🔧','❄️','🪚','🧹','🔩','🔌','🎨','🪲','📹'].find(() => true)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.service?.name || r.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {r.title !== r.service?.name ? r.title : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: urgencyColors[r.urgency],
                    background: `${urgencyColors[r.urgency]}20`, padding: '3px 8px', borderRadius: 20
                  }}>
                    {r.urgency?.toUpperCase()}
                  </span>
                  <span className={getStatusBadgeClass(r.status)}>{getStatusLabel(r.status)}</span>
                </div>
              </div>

              <div className="request-card-meta">
                <span className="request-meta-item">📍 {r.location?.city}</span>
                <span className="request-meta-item">📅 {formatDate(r.createdAt)}</span>
                {r.provider?.name && <span className="request-meta-item">🔧 {r.provider.name}</span>}
                {r.quotation?.amount > 0 && (
                  <span className="request-meta-item" style={{ color: r.quotation.isApproved ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                    💰 {formatCurrency(r.quotation.amount)} {r.quotation.isApproved ? '(Approved)' : '(Quote)'}
                  </span>
                )}
                {r.payment?.status === 'paid' && <span className="request-meta-item" style={{ color: 'var(--success)' }}>✅ Paid</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
