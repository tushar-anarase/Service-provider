import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import { formatDistanceToNow } from '../utils/helpers';

export default function TopHeader() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, setNotifications } = useSocket();
  const [showNotif, setShowNotif] = useState(false);
  const [search, setSearch] = useState('');
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load initial notifications
    api.get('/notifications').then(({ data }) => {
      setNotifications(data.notifications || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await api.put('/notifications/read-all');
    markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const notifIcon = (type) => {
    const icons = {
      new_request: '📋', request_accepted: '✅', status_update: '🔄',
      quotation: '💬', payment: '💳', review: '⭐', complaint: '⚠️',
      general: '🔔', verification: '🛡️',
    };
    return icons[type] || '🔔';
  };

  const pageTitles = {
    '/customer': 'Dashboard', '/customer/requests': 'My Requests',
    '/customer/requests/new': 'Create Request', '/customer/payments': 'Payments',
    '/customer/profile': 'My Profile',
    '/provider': 'Dashboard', '/provider/jobs/available': 'Find Jobs',
    '/provider/jobs': 'My Jobs', '/provider/earnings': 'Earnings',
    '/provider/profile': 'Profile',
    '/admin': 'Admin Dashboard', '/admin/users': 'Users',
    '/admin/services': 'Services', '/admin/requests': 'Requests',
    '/admin/complaints': 'Complaints', '/admin/payments': 'Payments',
  };

  const currentPath = window.location.pathname;
  const title = pageTitles[currentPath] || 'ServicePro';

  return (
    <header className="top-header">
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Space Grotesk, sans-serif' }}>{title}</h2>
      </div>

      <div className="header-search">
        <span className="header-search-icon">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          onKeyDown={e => {
            if (e.key === 'Enter' && user?.role === 'customer') {
              navigate(`/customer?search=${search}`);
            }
          }}
        />
      </div>

      <div className="header-actions">
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <div className="notif-btn" onClick={() => setShowNotif(p => !p)}>
            🔔
            {unreadCount > 0 && <span className="notif-dot" />}
          </div>

          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <span style={{ fontWeight: '700' }}>Notifications {unreadCount > 0 && <span className="badge badge-danger">{unreadCount}</span>}</span>
                <button className="btn btn-sm btn-secondary" onClick={handleMarkAllRead}>Mark all read</button>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="empty-icon">🔔</div>
                    <p>No notifications yet</p>
                  </div>
                ) : notifications.map(n => (
                  <div key={n._id} className={`notif-item flex gap-12 ${!n.isRead ? 'unread' : ''}`}>
                    <span className="notif-item-icon">{notifIcon(n.type)}</span>
                    <div className="notif-item-content">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-msg">{n.message}</div>
                      <div className="notif-item-time">{formatDistanceToNow(n.createdAt)}</div>
                    </div>
                    {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="avatar avatar-sm"
          style={{ cursor: 'pointer', width: 38, height: 38, fontSize: 14 }}
          onClick={() => navigate(`/${user?.role}/profile`)}
        >
          {user?.avatar ? <img src={user.avatar} alt={user?.name} /> : user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
