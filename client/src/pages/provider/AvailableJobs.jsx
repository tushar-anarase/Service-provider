import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatCurrency } from '../../utils/helpers';

const URGENCY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#fb923c', emergency: '#ef4444' };

export default function AvailableJobs() {
  const navigate = useNavigate();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [filters, setFilters] = useState({ city: '', urgency: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      const { data } = await api.get(`/requests/available?${params}`);
      setJobs(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters.city]);

  const accept = async (jobId) => {
    setAccepting(jobId);
    try {
      await api.put(`/requests/${jobId}/accept`);
      toast.success('Job Accepted!', 'Customer has been notified. Head to the location!');
      navigate(`/provider/jobs/${jobId}`);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Could not accept');
    } finally { setAccepting(null); }
  };

  const filtered = jobs.filter(j => !filters.urgency || j.urgency === filters.urgency);

  return (
    <div>
      <div className="page-header">
        <h1>Available Jobs Nearby</h1>
        <p>Browse and accept service requests in your area</p>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap" style={{ maxWidth: 250 }}>
          <span className="search-icon">📍</span>
          <input className="search-input" placeholder="Filter by city..." value={filters.city}
            onChange={e => setFilters(p => ({ ...p, city: e.target.value }))} />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filters.urgency}
          onChange={e => setFilters(p => ({ ...p, urgency: e.target.value }))}>
          <option value="">All Urgency</option>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🟠 High</option>
          <option value="emergency">🔴 Emergency</option>
        </select>
        <button className="btn btn-secondary btn-sm" onClick={load}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading-page"><div className="loader" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No jobs available right now</h3>
          <p>Check back later or expand your service area in your profile</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(j => (
            <div key={j._id} className="card" style={{ position: 'relative' }}>
              {j.urgency === 'emergency' && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: 'var(--danger)', borderRadius: '16px 16px 0 0'
                }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16 }}>{j.service?.name || j.title}</h3>
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: URGENCY_COLORS[j.urgency],
                      background: `${URGENCY_COLORS[j.urgency]}20`, padding: '3px 10px',
                      borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>{j.urgency} {j.urgency === 'emergency' && '🚨'}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                    {j.description?.substring(0, 150)}{j.description?.length > 150 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      📍 {j.location?.city}, {j.location?.pincode}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      📅 {formatDate(j.createdAt)}
                    </span>
                    {j.images?.length > 0 && (
                      <span style={{ fontSize: 13, color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        📷 {j.images.length} photo(s)
                      </span>
                    )}
                    {j.scheduledDate && (
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        🗓 Preferred: {formatDate(j.scheduledDate)}
                      </span>
                    )}
                  </div>
                  {j.images?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      {j.images.slice(0, 3).map((img, i) => (
                        <img key={i} src={img} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 130 }}>
                  <button
                    className="btn btn-success"
                    onClick={() => accept(j._id)}
                    disabled={accepting === j._id}
                  >
                    {accepting === j._id ? <><div className="loader loader-sm" />Accepting...</> : '✅ Accept Job'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/provider/jobs/${j._id}`)}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
