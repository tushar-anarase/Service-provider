import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const toast = useToast();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/complaints');
      setComplaints(data || []);
    } catch {
      toast.error('Error', 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.put(`/admin/complaints/${selectedComplaint._id}`, {
        status: resolutionStatus,
        adminResponse,
      });
      toast.success('Updated', 'Complaint resolved successfully');
      setSelectedComplaint(null);
      setAdminResponse('');
      fetchComplaints();
    } catch {
      toast.error('Error', 'Failed to update complaint');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Complaints & Dispute Mediation</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage customer and provider grievances, investigate issues, and record resolutions.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" /></div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No complaints found. Everything is running smoothly! 🎉</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Subject & Description</th>
                  <th style={{ padding: '12px 16px' }}>Filed By</th>
                  <th style={{ padding: '12px 16px' }}>Against</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', maxWidth: 320 }}>
                      <div style={{ fontWeight: 600 }}>{c.subject}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{c.description}</div>
                      {c.adminResponse && (
                        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--color-primary)', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 4 }}>
                          Admin Note: {c.adminResponse}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{c.complainant?.name || 'User'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.complainant?.role}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{c.against?.name || 'Platform/Service'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.against?.role}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${c.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 12 }}>
                      {formatDate(c.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setAdminResponse(c.adminResponse || '');
                          setResolutionStatus(c.status === 'resolved' ? 'resolved' : 'resolved');
                        }}
                        className="btn btn-outline btn-xs"
                      >
                        Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedComplaint && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="card" style={{ maxWidth: 500, width: '100%' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Respond to Complaint</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Regarding: <strong>{selectedComplaint.subject}</strong>
            </p>

            <form onSubmit={handleResolve} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                >
                  <option value="resolved">Resolved</option>
                  <option value="investigating">Investigating</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="label">Resolution / Action Taken</label>
                <textarea
                  rows="4"
                  required
                  className="input"
                  placeholder="Describe mediation action, refund details, or official note..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setSelectedComplaint(null)} className="btn btn-outline btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit Response</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
