import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: defaultRole,
    address: { city: '', state: '', pincode: '' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm(p => ({ ...p, address: { ...p.address, [field]: value } }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const user = await register(data);
      toast.success('Account created!', `Welcome to ServicePro, ${user.name}!`);
      if (user.role === 'provider') navigate('/provider');
      else navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 20,
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 50%)',
    }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, background: 'var(--gradient-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
            <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>Service<span style={{ color: 'var(--primary-light)' }}>Pro</span></span>
          </Link>
        </div>

        <div className="card" style={{ borderColor: 'var(--border-light)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Join thousands of users on ServicePro</p>

          {/* Role Selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            {[
              { role: 'customer', icon: '👤', label: 'Customer', desc: 'Find services' },
              { role: 'provider', icon: '🔧', label: 'Provider', desc: 'Offer services' },
            ].map(r => (
              <div
                key={r.role}
                onClick={() => setForm(p => ({ ...p, role: r.role }))}
                style={{
                  flex: 1, padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${form.role === r.role ? 'var(--primary)' : 'var(--border)'}`,
                  background: form.role === r.role ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.desc}</div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#f87171' }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handle} placeholder="Rahul Sharma" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handle} placeholder="9876543210" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" name="address.city" value={form.address.city} onChange={handle} placeholder="Mumbai" />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-control" name="address.state" value={form.address.state} onChange={handle} placeholder="Maharashtra" />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" name="password" value={form.password} onChange={handle} placeholder="Min 6 characters" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-control" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handle} placeholder="Repeat password" required />
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><div className="loader loader-sm" />Creating Account...</> : `Create ${form.role === 'provider' ? 'Provider' : 'Customer'} Account →`}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
