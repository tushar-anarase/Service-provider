import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const customerNav = [
  { to: '/customer', icon: '🏠', label: 'Dashboard', end: true },
  { to: '/customer/requests/new', icon: '➕', label: 'New Request' },
  { to: '/customer/requests', icon: '📋', label: 'My Requests' },
  { to: '/customer/payments', icon: '💳', label: 'Payments' },
  { to: '/customer/profile', icon: '👤', label: 'Profile' },
];

const providerNav = [
  { to: '/provider', icon: '🏠', label: 'Dashboard', end: true },
  { to: '/provider/jobs/available', icon: '🔍', label: 'Find Jobs' },
  { to: '/provider/jobs', icon: '📋', label: 'My Jobs' },
  { to: '/provider/earnings', icon: '💰', label: 'Earnings' },
  { to: '/provider/profile', icon: '👤', label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: '📊', label: 'Dashboard', end: true },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/services', icon: '🔧', label: 'Services' },
  { to: '/admin/requests', icon: '📋', label: 'Requests' },
  { to: '/admin/complaints', icon: '⚠️', label: 'Complaints' },
  { to: '/admin/payments', icon: '💳', label: 'Payments' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = user.role === 'admin' ? adminNav : user.role === 'provider' ? providerNav : customerNav;
  const roleColor = { customer: '#6366f1', provider: '#10b981', admin: '#f59e0b' }[user.role];
  const roleLabel = { customer: 'Customer', provider: 'Pro Provider', admin: 'Administrator' }[user.role];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div className="sidebar-logo-text">Service<span>Pro</span></div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-section" style={{ marginTop: 'auto' }}>
          <div className="sidebar-section-label">Account</div>
          <div
            className="nav-item"
            onClick={handleLogout}
            style={{ color: '#ef4444' }}
          >
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar" style={{ background: roleColor }}>
            {user.avatar
              ? <img src={user.avatar} alt={user.name} />
              : user.name?.[0]?.toUpperCase()
            }
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role" style={{ color: roleColor }}>{roleLabel}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
