import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { getStatusBadgeClass, getStatusLabel, formatDate } from '../../utils/helpers';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/admin/requests', { params });
      setRequests(data.requests || []);
    } catch {
      toast.error('Error', 'Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Service Requests</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time monitoring of all service jobs on the platform.</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <select
            className="input"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="on_the_way">On The Way</option>
            <option value="arrived">Arrived</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" /></div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No service requests found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Service / Title</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Provider</th>
                  <th style={{ padding: '12px 16px' }}>Urgency</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{r.title || r.service?.name || 'Service Job'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.description}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{r.customer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.customer?.phone || r.customer?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {r.provider ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{r.provider?.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.provider?.phone || r.provider?.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: 13 }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${r.urgency === 'emergency' ? 'badge-danger' : r.urgency === 'urgent' ? 'badge-warning' : 'badge-info'}`} style={{ textTransform: 'capitalize' }}>
                        {r.urgency || 'normal'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${getStatusBadgeClass(r.status)}`}>
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 12 }}>
                      {formatDate(r.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Link to={`/customer/requests/${r._id}`} className="btn btn-outline btn-xs">
                        View
                      </Link>
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
