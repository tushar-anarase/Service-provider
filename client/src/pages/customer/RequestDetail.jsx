import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { getStatusBadgeClass, getStatusLabel, formatDateTime, formatCurrency, Stars } from '../../utils/helpers';

const STATUS_FLOW = ['pending', 'accepted', 'on_the_way', 'arrived', 'in_progress', 'completed'];
const STATUS_ICONS = { pending: '⏳', accepted: '✅', on_the_way: '🚗', arrived: '📍', in_progress: '🔨', completed: '🎉', cancelled: '❌', rejected: '🚫' };

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [activeTab, setActiveTab] = useState('status');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [quotaForm, setQuotaForm] = useState({ amount: '', breakdown: '', estimatedDuration: '' });
  const [providerStatus, setProviderStatus] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadRequest();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chat' && request) loadMessages();
  }, [activeTab, request]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => setMessages(prev => [...prev, e.detail]);
    window.addEventListener('newMessage', handler);
    return () => window.removeEventListener('newMessage', handler);
  }, []);

  const loadRequest = async () => {
    try {
      const { data } = await api.get(`/requests/${id}`);
      setRequest(data);
    } catch { toast.error('Error', 'Request not found'); navigate(-1); }
    setLoading(false);
  };

  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${id}`);
      setMessages(data);
    } catch {}
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    const otherId = user.role === 'customer' ? request.provider?._id : request.customer?._id;
    if (!otherId) return;
    try {
      await api.post('/messages', { requestId: id, receiverId: otherId, message: newMsg });
      setNewMsg('');
      loadMessages();
    } catch {}
  };

  const approveQuotation = async () => {
    try {
      await api.put(`/requests/${id}/approve-quotation`);
      toast.success('Quotation Approved!', 'The provider will proceed with the work');
      loadRequest();
    } catch { toast.error('Error', 'Could not approve quotation'); }
  };

  const cancelRequest = async () => {
    if (!confirm('Cancel this request?')) return;
    try {
      await api.put(`/requests/${id}/cancel`, { reason: 'Cancelled by customer' });
      toast.success('Cancelled', 'Request has been cancelled');
      loadRequest();
    } catch { toast.error('Error', 'Could not cancel'); }
  };

  const markPayment = async () => {
    try {
      await api.post(`/requests/${id}/payment`, { method: request.payment?.method || 'cash' });
      toast.success('Payment Marked!', 'Invoice generated successfully');
      loadRequest();
    } catch { toast.error('Error', 'Could not process payment'); }
  };

  const submitReview = async () => {
    try {
      await api.post('/reviews', { requestId: id, ...reviewForm });
      toast.success('Review Submitted!', 'Thank you for your feedback');
      loadRequest();
    } catch (err) { toast.error('Error', err.response?.data?.message || 'Failed'); }
  };

  const updateStatus = async (status) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      toast.success('Status Updated', `Marked as ${getStatusLabel(status)}`);
      loadRequest();
    } catch { toast.error('Error', 'Could not update status'); }
  };

  const submitQuotation = async () => {
    try {
      await api.put(`/requests/${id}/quotation`, quotaForm);
      toast.success('Quotation Sent!', 'Customer will be notified');
      loadRequest();
    } catch { toast.error('Error', 'Could not send quotation'); }
  };

  const acceptJob = async () => {
    try {
      await api.put(`/requests/${id}/accept`);
      toast.success('Job Accepted!', 'Customer notified. Head to the location.');
      loadRequest();
    } catch (err) { toast.error('Error', err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-page"><div className="loader" /></div>;
  if (!request) return null;

  const isCustomer = user.role === 'customer';
  const isProvider = user.role === 'provider';
  const currentStatusIdx = STATUS_FLOW.indexOf(request.status);
  const otherUser = isCustomer ? request.provider : request.customer;

  const PROVIDER_STATUSES = [
    { s: 'on_the_way', l: '🚗 On The Way' },
    { s: 'arrived', l: '📍 Arrived' },
    { s: 'in_progress', l: '🔨 In Progress' },
    { s: 'completed', l: '🎉 Mark Completed' },
  ];

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{request.service?.name || request.title}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>#{request._id?.slice(-8).toUpperCase()}</div>
        </div>
        <span className={getStatusBadgeClass(request.status)}>{getStatusLabel(request.status)}</span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['status', 'details', 'chat', ...(request.status === 'completed' && !request.isReviewed && isCustomer ? ['review'] : [])].map(t => (
          <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'chat' && '💬'}
            {t === 'review' && '⭐'}
          </div>
        ))}
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          <div>
            {/* Status Timeline */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Status Timeline</h3>
              <div className="status-timeline">
                {STATUS_FLOW.map((s, i) => {
                  const isDone = i < currentStatusIdx;
                  const isCurrent = i === currentStatusIdx;
                  return (
                    <div key={s} className="timeline-item">
                      <div className={`timeline-dot ${isCurrent ? 'active' : isDone ? 'done' : ''}`}>
                        {isDone ? '✓' : STATUS_ICONS[s]}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-title" style={{ color: isCurrent ? 'var(--primary-light)' : isDone ? 'var(--success)' : 'var(--text-muted)' }}>
                          {getStatusLabel(s)}
                        </div>
                        {request.statusHistory?.find(h => h.status === s) && (
                          <div className="timeline-time">{formatDateTime(request.statusHistory.find(h => h.status === s).timestamp)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quotation Section */}
            {request.quotation?.amount > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>💰 Quotation</h3>
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-light)' }}>{formatCurrency(request.quotation.amount)}</div>
                  {request.quotation.breakdown && <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>{request.quotation.breakdown}</p>}
                  {request.quotation.estimatedDuration && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>⏱ {request.quotation.estimatedDuration}</p>}
                </div>
                {isCustomer && !request.quotation.isApproved && ['accepted', 'on_the_way', 'arrived'].includes(request.status) && (
                  <button className="btn btn-success btn-full" onClick={approveQuotation}>✅ Approve Quotation</button>
                )}
                {request.quotation.isApproved && <div className="badge badge-success">✅ Quotation Approved</div>}
              </div>
            )}

            {/* Provider Actions */}
            {isProvider && request.status === 'pending' && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Accept this Job?</h3>
                <button className="btn btn-success btn-full" onClick={acceptJob}>✅ Accept Job</button>
              </div>
            )}
            {isProvider && request.status === 'accepted' && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📝 Send Quotation</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input className="form-control" type="number" value={quotaForm.amount} onChange={e => setQuotaForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Duration</label>
                    <input className="form-control" value={quotaForm.estimatedDuration} onChange={e => setQuotaForm(p => ({ ...p, estimatedDuration: e.target.value }))} placeholder="e.g. 2-3 hours" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Breakdown</label>
                  <textarea className="form-control" rows={2} value={quotaForm.breakdown} onChange={e => setQuotaForm(p => ({ ...p, breakdown: e.target.value }))} placeholder="Parts, labor, etc..." />
                </div>
                <button className="btn btn-primary btn-full" onClick={submitQuotation}>Send Quotation</button>
              </div>
            )}
            {isProvider && ['accepted', 'on_the_way', 'arrived', 'in_progress'].includes(request.status) && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Update Job Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PROVIDER_STATUSES.filter(ps => STATUS_FLOW.indexOf(ps.s) > STATUS_FLOW.indexOf(request.status)).map(ps => (
                    <button key={ps.s} className={`btn ${ps.s === 'completed' ? 'btn-success' : 'btn-primary'}`} onClick={() => updateStatus(ps.s)}>
                      {ps.l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment */}
            {isCustomer && request.status === 'completed' && request.payment?.status !== 'paid' && (
              <div className="card" style={{ marginBottom: 16, border: '1px solid var(--success)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>💳 Complete Payment</h3>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)', marginBottom: 12 }}>
                  {formatCurrency(request.quotation?.amount || 0)}
                </div>
                <button className="btn btn-success btn-full" onClick={markPayment}>💳 Confirm Payment</button>
              </div>
            )}
            {request.payment?.status === 'paid' && (
              <div className="card" style={{ marginBottom: 16, border: '1px solid var(--success)' }}>
                <div style={{ color: 'var(--success)', fontWeight: 700 }}>✅ Payment Completed — {formatCurrency(request.payment.amount)}</div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div>
            {/* Provider/Customer Info */}
            {otherUser && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 14 }}>{isCustomer ? '🔧 Your Provider' : '👤 Customer'}</h3>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="avatar avatar-md" style={{ background: 'var(--gradient-primary)' }}>{otherUser.name?.[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{otherUser.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📞 {otherUser.phone}</div>
                    {otherUser.providerProfile?.rating > 0 && <Stars rating={otherUser.providerProfile.rating} size={14} />}
                  </div>
                </div>
                {isCustomer && request.status !== 'pending' && (
                  <button className="btn btn-secondary btn-full btn-sm" style={{ marginTop: 12 }} onClick={() => setActiveTab('chat')}>
                    💬 Chat with Provider
                  </button>
                )}
              </div>
            )}

            {/* Cancel */}
            {isCustomer && ['pending', 'accepted'].includes(request.status) && (
              <button className="btn btn-danger btn-full btn-sm" onClick={cancelRequest}>Cancel Request</button>
            )}
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Request Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { l: 'Service', v: request.service?.name },
              { l: 'Title', v: request.title },
              { l: 'Description', v: request.description },
              { l: 'Urgency', v: request.urgency?.toUpperCase() },
              { l: 'Location', v: `${request.location?.address}, ${request.location?.city} - ${request.location?.pincode}` },
              { l: 'Scheduled', v: request.scheduledDate ? `${formatDateTime(request.scheduledDate)} at ${request.scheduledTime || 'Anytime'}` : 'Flexible' },
            ].map(item => (
              <div key={item.l} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>{item.l}</span>
                <span style={{ fontSize: 14 }}>{item.v || '—'}</span>
              </div>
            ))}
          </div>
          {request.images?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Attached Photos</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {request.images.map((img, i) => (
                  <img key={i} src={img} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => window.open(img, '_blank')} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="empty-state" style={{ padding: 30 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : messages.map((m, i) => {
                const isMine = m.sender?._id === user._id || m.sender === user._id;
                return (
                  <div key={i} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start' }}>
                    {!isMine && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.sender?.name}</div>}
                    <div className={`chat-bubble ${isMine ? 'sent' : 'received'}`}>
                      {m.message}
                      <div className="chat-time">{new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input-area">
              <input
                className="chat-input"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="btn btn-primary btn-sm" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Tab */}
      {activeTab === 'review' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>⭐ Rate Your Experience</h3>
          <div className="form-group">
            <label className="form-label">Rating</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <span key={n} onClick={() => setReviewForm(p => ({ ...p, rating: n }))}
                  style={{ fontSize: 32, cursor: 'pointer', color: n <= reviewForm.rating ? '#f59e0b' : 'var(--border-light)' }}>★</span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Review Comment</label>
            <textarea className="form-control" rows={4} value={reviewForm.comment}
              onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
              placeholder="How was the service? Was the provider professional, on time?" />
          </div>
          <button className="btn btn-primary btn-full" onClick={submitReview}>Submit Review</button>
        </div>
      )}
    </div>
  );
}
