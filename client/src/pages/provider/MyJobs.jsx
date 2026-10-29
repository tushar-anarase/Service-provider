import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { getStatusBadgeClass, getStatusLabel, formatDate, formatCurrency } from '../../utils/helpers';

export default function ProviderJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    api.get('/requests').then(({ data }) => {
      setJobs(data.requests?.filter(r => r.provider) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    if (activeTab === 'active') return ['accepted', 'on_the_way', 'arrived', 'in_progress'].includes(j.status);
    if (activeTab === 'completed') return j.status === 'completed';
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1>My Jobs</h1>
        <p>All your accepted and past service jobs</p>
      </div>
      <div className="tabs">
        {[['all', 'All Jobs'], ['active', 'Active'], ['completed', 'Completed']].map(([v, l]) => (
          <div key={v} className={`tab ${activeTab === v ? 'active' : ''}`} onClick={() => setActiveTab(v)}>{l}</div>
        ))}
      </div>
      {loading ? <div className="loading-page"><div className="loader" /></div>
        : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No {activeTab !== 'all' ? activeTab : ''} jobs</h3>
            <p>Accept jobs from the Find Jobs section</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/provider/jobs/available')}>Find Jobs</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(j => (
              <div key={j._id} className="request-card" onClick={() => navigate(`/provider/jobs/${j._id}`)}>
                <div className="request-card-header">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{j.service?.name || j.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                      👤 {j.customer?.name} • 📍 {j.location?.city}
                    </div>
                  </div>
                  <span className={getStatusBadgeClass(j.status)}>{getStatusLabel(j.status)}</span>
                </div>
                <div className="request-card-meta">
                  <span className="request-meta-item">📅 {formatDate(j.createdAt)}</span>
                  {j.quotation?.amount > 0 && <span className="request-meta-item" style={{ color: 'var(--success)', fontWeight: 600 }}>💰 {formatCurrency(j.quotation.amount)}</span>}
                  {j.payment?.status === 'paid' && <span className="request-meta-item" style={{ color: 'var(--success)' }}>✅ Payment Received</span>}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
