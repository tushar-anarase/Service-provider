// Format date distances
export const formatDistanceToNow = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
};

export const getStatusBadgeClass = (status) => {
  const map = {
    pending: 'status-pending', accepted: 'status-accepted', assigned: 'status-accepted',
    on_the_way: 'status-on_the_way', arrived: 'status-arrived',
    in_progress: 'status-in_progress', completed: 'status-completed',
    cancelled: 'status-cancelled', rejected: 'status-cancelled',
  };
  return `badge ${map[status] || 'badge-muted'}`;
};

export const getUrgencyClass = (urgency) => {
  const map = { low: 'urgency-low', medium: 'urgency-medium', high: 'urgency-high', emergency: 'urgency-emergency' };
  return map[urgency] || '';
};

export const getStatusLabel = (status) => {
  const map = {
    pending: 'Pending', accepted: 'Accepted', assigned: 'Assigned',
    on_the_way: 'On The Way', arrived: 'Arrived', in_progress: 'In Progress',
    completed: 'Completed', cancelled: 'Cancelled', rejected: 'Rejected',
  };
  return map[status] || status;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const Stars = ({ rating, size = 16 }) => (
  <div className="stars" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#f59e0b' : '#374151' }}>★</span>
    ))}
    <span style={{ fontSize: size - 2, color: 'var(--text-secondary)', marginLeft: 4 }}>{rating?.toFixed(1) || '0.0'}</span>
  </div>
);
